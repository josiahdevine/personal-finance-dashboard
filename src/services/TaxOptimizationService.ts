import { SecurityAllocation, TaxLotData, TaxHarvestOpportunity } from '../types/Investment';

class TaxOptimizationService {
    private readonly LONG_TERM_DAYS = 365;
    private readonly WASH_SALE_WINDOW = 30;
    private readonly MIN_LOSS_THRESHOLD = 1000; // Minimum loss to consider harvesting
    private readonly MIN_TAX_SAVINGS = 50; // Minimum estimated tax savings to recommend harvesting

    /**
     * Find tax loss harvesting opportunities
     */
    async findHarvestingOpportunities(
        securities: SecurityAllocation[],
        taxRate: number
    ): Promise<TaxHarvestOpportunity[]> {
        // Get tax lots for each security
        const taxLots = await this.getTaxLots(securities);

        // Find securities with unrealized losses
        const opportunities: TaxHarvestOpportunity[] = [];

        for (const security of securities) {
            const securityLots = taxLots.filter(lot => lot.securityId === security.securityId);
            const totalLoss = this.calculateTotalLoss(securityLots, security.price);

            if (Math.abs(totalLoss) >= this.MIN_LOSS_THRESHOLD) {
                const taxSavingsEstimate = Math.abs(totalLoss) * taxRate;

                if (taxSavingsEstimate >= this.MIN_TAX_SAVINGS) {
                    opportunities.push({
                        securityId: security.securityId,
                        ticker: security.ticker,
                        name: security.name,
                        totalQuantity: security.quantity,
                        totalValue: security.value,
                        totalCostBasis: security.costBasis,
                        unrealizedLoss: totalLoss,
                        unrealizedLossPercent: (totalLoss / security.costBasis) * 100,
                        lots: securityLots,
                        recommendedAction: 'harvest',
                        alternativeInvestments: await this.findAlternatives(security)
                    });
                }
            }
        }

        // Sort opportunities by potential tax savings
        return opportunities.sort((a, b) => Math.abs(b.unrealizedLossPercent) - Math.abs(a.unrealizedLossPercent));
    }

    /**
     * Get tax lots for securities
     */
    private async getTaxLots(securities: SecurityAllocation[]): Promise<TaxLotData[]> {
        // In a real implementation, we would:
        // 1. Fetch transaction history for each security
        // 2. Calculate cost basis for each lot
        // 3. Track wash sales

        // For now, generate dummy tax lot data
        const lots: TaxLotData[] = [];

        securities.forEach(security => {
            // Split each security into 1-3 tax lots
            const numLots = Math.floor(Math.random() * 3) + 1;
            const quantity = security.quantity;
            const lotSize = quantity / numLots;

            for (let i = 0; i < numLots; i++) {
                // Random acquisition date in the past 1-3 years
                const daysAgo = Math.floor(Math.random() * 1000) + 30;
                const acquisitionDate = new Date();
                acquisitionDate.setDate(acquisitionDate.getDate() - daysAgo);

                // Random cost basis variation
                const _costBasisPerShare = security.price * (0.9 + Math.random() * 0.4);
                const lotQuantity = lotSize;
                const lotValue = lotQuantity * security.price;
                const lotCostBasis = lotQuantity * (security.costBasis / security.quantity);
                const lotGain = lotValue - lotCostBasis;
                const _lotGainPercentage = (lotGain / lotCostBasis) * 100;

                const taxLot: TaxLotData = {
                    id: `lot-${security.securityId}-${i}`,
                    holdingId: security.securityId,
                    securityId: security.securityId,
                    quantity: lotQuantity,
                    costBasis: lotCostBasis,
                    acquiredAt: acquisitionDate.toISOString(),
                    isWashSale: false
                };

                lots.push(taxLot);
            }
        });

        return lots;
    }

    /**
     * Calculate the total unrealized loss for a set of tax lots
     */
    private calculateTotalLoss(lots: TaxLotData[], currentPrice: number): number {
        return lots.reduce((total, lot) => {
            const currentValue = lot.quantity * currentPrice;
            const unrealizedGain = currentValue - lot.costBasis;
            // Only include lots with losses
            return unrealizedGain < 0 ? total + unrealizedGain : total;
        }, 0);
    }

    /**
     * Find alternative securities for tax loss harvesting
     */
    private async findAlternatives(security: SecurityAllocation): Promise<Array<{
        ticker: string;
        name: string;
        correlation: number;
    }>> {
        // In a real implementation, we would:
        // 1. Use a security database to find similar securities
        // 2. Calculate correlations between securities
        // 3. Check expense ratios and other factors
        // 4. Ensure alternatives don't trigger wash sale rules

        // For now, return dummy alternatives
        if (security.ticker?.includes('ETF')) {
            return [
                {
                    ticker: 'VTI',
                    name: 'Vanguard Total Stock Market ETF',
                    correlation: 0.92
                },
                {
                    ticker: 'ITOT',
                    name: 'iShares Core S&P Total U.S. Stock Market ETF',
                    correlation: 0.94
                }
            ];
        }

        // For individual stocks, suggest sector ETFs
        return [
            {
                ticker: 'XLK',
                name: 'Technology Select Sector SPDR Fund',
                correlation: 0.85,
            },
            {
                ticker: 'VGT',
                name: 'Vanguard Information Technology ETF',
                correlation: 0.84,
            },
        ];
    }

    /**
     * Check for potential wash sales
     */
    private checkWashSale(
        _security: SecurityAllocation,
        _lots: TaxLotData[],
        _recentTransactions: any[] // Replace with actual transaction type
    ): boolean {
        // In a real implementation, we would:
        // 1. Check for purchases of substantially identical securities
        // 2. Look at transactions within the wash sale window
        // 3. Consider both realized and unrealized wash sales
        // 4. Track across all accounts

        // For now, return false (no wash sale)
        return false;
    }
}

export const taxOptimizationService = new TaxOptimizationService(); 