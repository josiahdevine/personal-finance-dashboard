import { CategoryService } from './CategoryService';
import { Transaction } from '../types/Transaction';

interface CategoryMatch {
  categoryId: string;
  confidence: number;
  rule?: string;
  method: 'exact' | 'pattern' | 'ml' | 'fallback';
}

class TransactionCategorizationService {
  private rules: Map<string, string> = new Map(); // pattern -> categoryId
  private merchantCategories: Map<string, string> = new Map(); // merchant -> categoryId
  private initialized = false;

  /**
   * Initialize the service by loading rules and merchant mappings
   */
  private async initialize() {
    if (this.initialized) return;

    try {
      // Load category rules
      const rules = await CategoryService.getCategoryRules();
      rules.forEach(rule => {
        this.rules.set(rule.pattern.toLowerCase(), rule.categoryId);
      });

      // Load merchant mappings from successful categorizations
      const merchantMappings = await this.loadMerchantMappings();
      merchantMappings.forEach(({ merchant, categoryId }) => {
        this.merchantCategories.set(merchant.toLowerCase(), categoryId);
      });

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing TransactionCategorizationService:', error);
      throw error;
    }
  }

  /**
   * Categorize a transaction using multiple methods
   */
  async categorizeTransaction(transaction: Transaction): Promise<CategoryMatch> {
    await this.initialize();

    const description = transaction.description?.toLowerCase() || '';
    const merchant = transaction.merchant_name?.toLowerCase() || '';
    const amount = transaction.amount;

    // Try exact merchant match first (highest confidence)
    if (merchant && this.merchantCategories.has(merchant)) {
      return {
        categoryId: this.merchantCategories.get(merchant)!,
        confidence: 0.95,
        method: 'exact'
      };
    }

    // Try pattern matching against rules
    for (const [pattern, categoryId] of this.rules.entries()) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(description) || regex.test(merchant)) {
        return {
          categoryId,
          confidence: 0.85,
          rule: pattern,
          method: 'pattern'
        };
      }
    }

    // Try machine learning suggestion
    try {
      const suggestion = await CategoryService.suggestCategory(
        `${merchant} ${description}`
      );
      
      if (suggestion.confidence > 0.6) {
        return {
          ...suggestion,
          method: 'ml'
        };
      }
    } catch (error) {
      console.error('Error getting category suggestion:', error);
    }

    // Use amount-based heuristics as fallback
    return this.getFallbackCategory(amount);
  }

  /**
   * Load merchant to category mappings from successful categorizations
   */
  private async loadMerchantMappings(): Promise<Array<{
    merchant: string;
    categoryId: string;
  }>> {
    // In a real implementation, this would load from a database
    // For now, return some common mappings
    return [
      { merchant: 'netflix', categoryId: 'entertainment' },
      { merchant: 'spotify', categoryId: 'entertainment' },
      { merchant: 'amazon', categoryId: 'shopping' },
      { merchant: 'uber', categoryId: 'transportation' },
      { merchant: 'lyft', categoryId: 'transportation' },
      { merchant: 'walmart', categoryId: 'shopping' },
      { merchant: 'target', categoryId: 'shopping' },
      { merchant: 'kroger', categoryId: 'groceries' },
      { merchant: 'safeway', categoryId: 'groceries' },
      { merchant: 'trader joe', categoryId: 'groceries' },
      { merchant: 'whole foods', categoryId: 'groceries' },
      { merchant: 'cvs', categoryId: 'health' },
      { merchant: 'walgreens', categoryId: 'health' },
      { merchant: 'verizon', categoryId: 'utilities' },
      { merchant: 'at&t', categoryId: 'utilities' },
      { merchant: 'comcast', categoryId: 'utilities' },
      { merchant: 'xfinity', categoryId: 'utilities' }
    ];
  }

  /**
   * Get fallback category based on amount
   */
  private getFallbackCategory(amount: number): CategoryMatch {
    // Simple heuristics based on amount
    if (amount > 0) {
      if (amount > 1000) {
        return {
          categoryId: 'income-salary',
          confidence: 0.4,
          method: 'fallback'
        };
      }
      return {
        categoryId: 'income-other',
        confidence: 0.3,
        method: 'fallback'
      };
    }

    const absAmount = Math.abs(amount);
    if (absAmount > 1000) {
      return {
        categoryId: 'housing',
        confidence: 0.4,
        method: 'fallback'
      };
    }
    if (absAmount > 100) {
      return {
        categoryId: 'shopping',
        confidence: 0.3,
        method: 'fallback'
      };
    }
    return {
      categoryId: 'other',
      confidence: 0.2,
      method: 'fallback'
    };
  }

  /**
   * Learn from user corrections
   */
  async learnFromCorrection(
    transaction: Transaction,
    correctCategoryId: string
  ): Promise<void> {
    await this.initialize();

    const merchant = transaction.merchant_name?.toLowerCase();
    if (merchant) {
      // Update merchant mapping if confidence was low or categorization was wrong
      const currentMapping = this.merchantCategories.get(merchant);
      if (!currentMapping || currentMapping !== correctCategoryId) {
        this.merchantCategories.set(merchant, correctCategoryId);
        // In a real implementation, save this to the database
      }
    }

    // In a real implementation:
    // 1. Store the correction for ML training
    // 2. Update pattern rules if needed
    // 3. Update confidence scores
  }

  /**
   * Batch categorize transactions
   */
  async batchCategorize(
    transactions: Transaction[]
  ): Promise<Array<{ transaction: Transaction; category: CategoryMatch }>> {
    await this.initialize();

    const results = [];
    for (const transaction of transactions) {
      const category = await this.categorizeTransaction(transaction);
      results.push({ transaction, category });
    }

    return results;
  }

  /**
   * Get categorization stats
   */
  async getCategorizationStats(): Promise<{
    totalCategorized: number;
    methodBreakdown: Record<string, number>;
    averageConfidence: number;
    topMerchants: Array<{ merchant: string; count: number }>;
  }> {
    // In a real implementation, this would query the database
    // For now, return placeholder stats
    return {
      totalCategorized: 1000,
      methodBreakdown: {
        exact: 450,
        pattern: 300,
        ml: 200,
        fallback: 50
      },
      averageConfidence: 0.85,
      topMerchants: [
        { merchant: 'amazon', count: 120 },
        { merchant: 'walmart', count: 80 },
        { merchant: 'target', count: 60 },
        { merchant: 'netflix', count: 40 },
        { merchant: 'uber', count: 30 }
      ]
    };
  }
}

export const transactionCategorizationService = new TransactionCategorizationService(); 