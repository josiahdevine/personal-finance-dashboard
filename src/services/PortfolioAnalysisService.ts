import { db } from '../config/database';
import { 
    PortfolioSummary, 
    AssetClassAllocation, 
    SectorAllocation, 
    SecurityAllocation
} from '../types/Investment';

class PortfolioAnalysisService {
    /**
     * Get portfolio analysis
     */
    async getPortfolioAnalysis(
        userId: string,
        accountIds?: string[]
    ): Promise<PortfolioSummary> {
        // Get holdings from the database
        const holdings = await this.getHoldings(userId, accountIds);
        
        // Calculate total portfolio value
        const totalValue = holdings.reduce((total, holding) => total + holding.value, 0);
        
        // Calculate investment gain
        const totalCostBasis = holdings.reduce((total, holding) => {
            return total + (holding.costBasis || holding.value);
        }, 0);
        
        const totalGain = totalValue - totalCostBasis;
        const totalGainPercentage = (totalGain / totalCostBasis) * 100;
        
        // Calculate cash value
        const cashValue = holdings
            .filter(h => h.security.is_cash_equivalent)
            .reduce((total, holding) => total + holding.value, 0);
        
        // Calculate invested value (non-cash)
        const investedValue = totalValue - cashValue;
        
        // Create security allocations
        const securities = this.createSecurityAllocations(holdings, totalValue);
        
        // Create asset class allocation
        const assetAllocation = this.createAssetClassAllocation(securities);
        
        // Create sector allocation
        const sectorAllocation = this.createSectorAllocation(securities);
        
        // Calculate risk metrics
        const riskMetrics = await this.calculateRiskMetrics();
        
        // Calculate performance metrics
        const performanceMetrics = await this.calculatePerformanceMetrics();
        
        return {
            totalValue,
            cashValue,
            investedValue,
            totalGain,
            totalGainPercentage,
            assetAllocation,
            sectorAllocation,
            securities,
            riskMetrics,
            performanceMetrics,
        };
    }
    
    /**
     * Get holdings for accounts
     */
    private async getHoldings(userId: string, accountIds?: string[]) {
        try {
            let query = `
                SELECT h.*, s.*, a.user_id
                FROM investment_holdings h
                JOIN investment_accounts a ON h.investment_account_id = a.id
                JOIN securities s ON h.security_id = s.id
                WHERE a.user_id = $1 AND a.deleted_at IS NULL AND a.is_closed = false
            `;
            
            const queryParams = [userId];
            
            if (accountIds && accountIds.length > 0) {
                query += ` AND a.id IN (${accountIds.map((_, i) => `$${i + 2}`).join(',')})`;
                queryParams.push(...accountIds);
            }
            
            const result = await db.query(query, queryParams);
            
            // Transform results
            return result.rows.map(row => {
                return {
                    id: row.id,
                    accountId: row.investment_account_id,
                    securityId: row.security_id,
                    quantity: row.quantity,
                    value: row.value || row.institution_value,
                    costBasis: row.cost_basis,
                    price: row.institution_price || (row.quantity ? row.value / row.quantity : 0),
                    security: {
                        id: row.security_id,
                        name: row.name,
                        ticker_symbol: row.ticker_symbol,
                        type: row.type,
                        close_price: row.close_price,
                        is_cash_equivalent: row.is_cash_equivalent,
                    },
                };
            });
        } catch (error) {
            console.error('Error getting holdings:', error);
            throw error;
        }
    }
    
    /**
     * Create security allocations
     */
    private createSecurityAllocations(
        holdings: any[],
        totalValue: number
    ): SecurityAllocation[] {
        return holdings.map(holding => {
            const gain = holding.costBasis 
                ? holding.value - holding.costBasis 
                : undefined;
            
            const gainPercentage = holding.costBasis && holding.costBasis > 0
                ? (gain! / holding.costBasis) * 100
                : undefined;
            
            return {
                securityId: holding.securityId,
                ticker: holding.security.ticker_symbol,
                name: holding.security.name,
                value: holding.value,
                percentage: (holding.value / totalValue) * 100,
                quantity: holding.quantity,
                price: holding.price,
                costBasis: holding.costBasis,
                gain,
                gainPercentage,
            };
        });
    }
    
    /**
     * Create asset class allocation
     */
    private createAssetClassAllocation(
        securities: SecurityAllocation[]
    ): AssetClassAllocation[] {
        const assetClasses: Record<string, {
            value: number;
            securities: SecurityAllocation[];
        }> = {};
        
        // Map security types to asset classes
        const assetClassMap: Record<string, string> = {
            'equity': 'Stocks',
            'fixed_income': 'Bonds',
            'cash': 'Cash',
            'derivative': 'Derivatives',
            'etf': 'ETFs',
            'mutual_fund': 'Mutual Funds',
            'other': 'Other',
        };
        
        securities.forEach(security => {
            // Get asset class from security type
            const securityType = this.getSecurityType(security);
            const assetClass = assetClassMap[securityType] || 'Other';
            
            if (!assetClasses[assetClass]) {
                assetClasses[assetClass] = {
                    value: 0,
                    securities: [],
                };
            }
            
            assetClasses[assetClass].value += security.value;
            assetClasses[assetClass].securities.push(security);
        });
        
        const totalValue = securities.reduce((sum, s) => sum + s.value, 0);
        
        return Object.entries(assetClasses).map(([assetClass, data]) => ({
            assetClass,
            value: data.value,
            percentage: (data.value / totalValue) * 100,
            securities: data.securities,
        }));
    }
    
    /**
     * Create sector allocation
     */
    private createSectorAllocation(
        securities: SecurityAllocation[]
    ): SectorAllocation[] {
        // In a real implementation, we would use a security data provider
        // to get sector information for each security
        
        // For now, we'll use a simplified approach with dummy data
        const sectors: Record<string, {
            value: number;
            securities: SecurityAllocation[];
        }> = {
            'Technology': { value: 0, securities: [] },
            'Financial': { value: 0, securities: [] },
            'Healthcare': { value: 0, securities: [] },
            'Consumer': { value: 0, securities: [] },
            'Industrial': { value: 0, securities: [] },
            'Utilities': { value: 0, securities: [] },
            'Energy': { value: 0, securities: [] },
            'Materials': { value: 0, securities: [] },
            'Real Estate': { value: 0, securities: [] },
            'Communication': { value: 0, securities: [] },
            'Other': { value: 0, securities: [] },
        };
        
        // Assign securities to sectors based on ticker symbol
        // This would be replaced by actual sector data in a real implementation
        securities.forEach(security => {
            let sector = 'Other';
            
            if (security.ticker) {
                const ticker = security.ticker.toUpperCase();
                
                // Dummy logic to assign sectors
                if (['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'].includes(ticker)) {
                    sector = 'Technology';
                } else if (['JPM', 'BAC', 'WFC', 'GS', 'MS'].includes(ticker)) {
                    sector = 'Financial';
                } else if (['JNJ', 'PFE', 'MRK', 'UNH', 'ABBV'].includes(ticker)) {
                    sector = 'Healthcare';
                }
                // ...add more sector assignments
            }
            
            sectors[sector].value += security.value;
            sectors[sector].securities.push(security);
        });
        
        const totalValue = securities.reduce((sum, s) => sum + s.value, 0);
        
        // Filter out sectors with no securities
        return Object.entries(sectors)
            .filter(([_, data]) => data.securities.length > 0)
            .map(([sector, data]) => ({
                sector,
                value: data.value,
                percentage: (data.value / totalValue) * 100,
                securities: data.securities,
            }));
    }
    
    /**
     * Get security type
     */
    private getSecurityType(security: SecurityAllocation): string {
        // This would be replaced by actual security type data
        if (security.name.toLowerCase().includes('cash')) {
            return 'cash';
        }
        
        if (security.ticker?.toUpperCase().includes('ETF')) {
            return 'etf';
        }
        
        // Default to equity
        return 'equity';
    }
    
    /**
     * Calculate risk metrics
     */
    private async calculateRiskMetrics() {
        // In a real implementation, this would calculate actual risk metrics
        // using historical price data for each security
        
        // For now, return placeholder values
        return {
            sharpeRatio: 1.2,
            beta: 0.85,
            alpha: 2.4,
            standardDeviation: 12.6,
            maxDrawdown: 15.3,
        };
    }
    
    /**
     * Calculate performance metrics
     */
    private async calculatePerformanceMetrics() {
        // In a real implementation, this would calculate actual performance
        // using historical account value data
        
        // For now, return placeholder values
        return {
            daily: 0.2,
            weekly: 1.5,
            monthly: 2.8,
            ytd: 12.5,
            oneYear: 18.3,
            threeYear: 32.7,
            fiveYear: 64.2,
            tenYear: undefined,
            sinceInception: 64.2,
        };
    }
}

export const portfolioAnalysisService = new PortfolioAnalysisService(); 