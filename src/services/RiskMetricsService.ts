import { SecurityAllocation, RiskMetrics } from '../types/Investment';

class RiskMetricsService {
    private readonly RISK_FREE_RATE = 0.04; // 4% annual risk-free rate
    private readonly MARKET_RETURN = 0.10; // 10% annual market return
    private readonly MARKET_STD_DEV = 0.15; // 15% annual market standard deviation

    /**
     * Calculate risk metrics for a portfolio
     */
    async calculateRiskMetrics(
        securities: SecurityAllocation[]
    ): Promise<RiskMetrics> {
        // Get historical returns for each security
        const returns = await this.getHistoricalReturns(securities);

        // Calculate portfolio return
        const portfolioReturn = this.calculatePortfolioReturn(securities, returns);

        // Calculate portfolio standard deviation
        const portfolioStdDev = this.calculatePortfolioStdDev(securities, returns);

        // Calculate Sharpe ratio
        const sharpeRatio = this.calculateSharpeRatio(portfolioReturn, portfolioStdDev);

        // Calculate beta
        const beta = this.calculateBeta(securities, returns);

        // Calculate alpha
        const alpha = this.calculateAlpha(portfolioReturn, beta);

        // Calculate maximum drawdown
        const maxDrawdown = this.calculateMaxDrawdown(securities, returns);

        return {
            sharpeRatio,
            beta,
            alpha,
            standardDeviation: portfolioStdDev,
            maxDrawdown,
            volatility: portfolioStdDev * Math.sqrt(252) // Annualized volatility
        };
    }

    /**
     * Get historical returns for securities
     */
    private async getHistoricalReturns(
        securities: SecurityAllocation[]
    ): Promise<Map<string, number[]>> {
        const returns = new Map<string, number[]>();

        // In a real implementation, we would:
        // 1. Fetch historical price data for each security
        // 2. Calculate daily/weekly/monthly returns
        // 3. Store the return series for each security

        // For now, generate dummy return data
        securities.forEach(security => {
            const numPeriods = 252; // One year of daily returns
            const returnSeries: number[] = [];

            for (let i = 0; i < numPeriods; i++) {
                // Generate random returns with mean = 8% and std = 20% (annualized)
                const dailyReturn = (0.08 / 252) + (0.20 / Math.sqrt(252)) * this.generateNormalRandom();
                returnSeries.push(dailyReturn);
            }

            returns.set(security.securityId, returnSeries);
        });

        return returns;
    }

    /**
     * Calculate portfolio return
     */
    private calculatePortfolioReturn(
        securities: SecurityAllocation[],
        returns: Map<string, number[]>
    ): number {
        let portfolioReturn = 0;

        securities.forEach(security => {
            const securityReturns = returns.get(security.securityId) || [];
            if (securityReturns.length > 0) {
                // Calculate average return for the security
                const avgReturn = securityReturns.reduce((sum, r) => sum + r, 0) / securityReturns.length;
                // Weight by portfolio allocation
                portfolioReturn += avgReturn * (security.percentage / 100);
            }
        });

        // Annualize the return
        return portfolioReturn * 252;
    }

    /**
     * Calculate portfolio standard deviation
     */
    private calculatePortfolioStdDev(
        securities: SecurityAllocation[],
        returns: Map<string, number[]>
    ): number {
        // In a real implementation, we would:
        // 1. Calculate the covariance matrix of security returns
        // 2. Calculate portfolio variance using weights and covariance matrix
        // 3. Take the square root to get standard deviation

        // For now, use a simplified calculation
        let portfolioVariance = 0;

        securities.forEach(security => {
            const securityReturns = returns.get(security.securityId) || [];
            if (securityReturns.length > 0) {
                // Calculate variance of security returns
                const mean = securityReturns.reduce((sum, r) => sum + r, 0) / securityReturns.length;
                const variance = securityReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / securityReturns.length;
                // Weight by squared portfolio allocation
                portfolioVariance += variance * Math.pow(security.percentage / 100, 2);
            }
        });

        // Annualize the standard deviation
        return Math.sqrt(portfolioVariance * 252);
    }

    /**
     * Calculate Sharpe ratio
     */
    private calculateSharpeRatio(portfolioReturn: number, portfolioStdDev: number): number {
        return (portfolioReturn - this.RISK_FREE_RATE) / portfolioStdDev;
    }

    /**
     * Calculate portfolio beta
     */
    private calculateBeta(
        securities: SecurityAllocation[],
        returns: Map<string, number[]>
    ): number {
        let portfolioBeta = 0;

        securities.forEach(security => {
            const securityReturns = returns.get(security.securityId) || [];
            if (securityReturns.length > 0) {
                // In a real implementation, we would:
                // 1. Get market returns for the same period
                // 2. Calculate covariance between security and market returns
                // 3. Divide by market variance to get beta

                // For now, generate a random beta between 0.5 and 1.5
                const securityBeta = 0.5 + Math.random();
                portfolioBeta += securityBeta * (security.percentage / 100);
            }
        });

        return portfolioBeta;
    }

    /**
     * Calculate portfolio alpha
     */
    private calculateAlpha(portfolioReturn: number, portfolioBeta: number): number {
        // Alpha = Portfolio Return - [Risk Free Rate + Beta * (Market Return - Risk Free Rate)]
        return portfolioReturn - (this.RISK_FREE_RATE + portfolioBeta * (this.MARKET_RETURN - this.RISK_FREE_RATE));
    }

    /**
     * Calculate maximum drawdown
     */
    private calculateMaxDrawdown(
        securities: SecurityAllocation[],
        returns: Map<string, number[]>
    ): number {
        // In a real implementation, we would:
        // 1. Calculate portfolio value series using returns
        // 2. Find the maximum peak-to-trough decline

        // For now, use a simplified calculation
        let maxDrawdown = 0;
        let peak = 1;
        let value = 1;

        // Combine security returns into portfolio returns
        const numPeriods = 252;
        for (let i = 0; i < numPeriods; i++) {
            let periodReturn = 0;
            securities.forEach(security => {
                const securityReturns = returns.get(security.securityId) || [];
                if (securityReturns[i] !== undefined) {
                    periodReturn += securityReturns[i] * (security.percentage / 100);
                }
            });

            value *= (1 + periodReturn);
            peak = Math.max(peak, value);
            const drawdown = (peak - value) / peak;
            maxDrawdown = Math.max(maxDrawdown, drawdown);
        }

        return maxDrawdown;
    }

    /**
     * Generate random number from standard normal distribution
     * Using Box-Muller transform
     */
    private generateNormalRandom(): number {
        const u1 = Math.random();
        const u2 = Math.random();
        
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return z;
    }
}

export const riskMetricsService = new RiskMetricsService(); 