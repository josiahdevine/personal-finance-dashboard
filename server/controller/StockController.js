const axios = require('axios');
const pool = require('../db');
const StockPriceCache = require('../models/StockPriceCache');

// Rate limit configuration for free tier
const RATE_LIMIT = {
    MAX_CALLS_PER_MINUTE: 5,
    DELAY_BETWEEN_CALLS: 15000 // 15 seconds between calls
};

// Market hours configuration (EST)
const MARKET_HOURS = {
    START: 9, // 9 AM EST
    END: 16, // 4 PM EST
    WEEKEND_DAYS: [0, 6] // Sunday = 0, Saturday = 6
};

let updateJob = null;

// Check if current time is during market hours
const isDuringMarketHours = () => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    return hour >= MARKET_HOURS.START && 
           hour < MARKET_HOURS.END && 
           !MARKET_HOURS.WEEKEND_DAYS.includes(day);
};

// Schedule the next update
const scheduleNextUpdate = async () => {
    if (updateJob) {
        clearTimeout(updateJob);
        updateJob = null;
    }
    try {
        // Calculate next update time
        const now = new Date();
        let nextUpdate = new Date();
        
        if (isDuringMarketHours()) {
            // During market hours, schedule next update in 24 hours
            nextUpdate.setDate(nextUpdate.getDate() + 1);
        } else {
            // Outside market hours, schedule for next market opening
            nextUpdate.setHours(MARKET_HOURS.START, 0, 0, 0);
            if (now.getHours() >= MARKET_HOURS.END) {
                // If after market close, schedule for next day
                nextUpdate.setDate(nextUpdate.getDate() + 1);
            }
            // Skip weekends
            while (MARKET_HOURS.WEEKEND_DAYS.includes(nextUpdate.getDay())) {
                nextUpdate.setDate(nextUpdate.getDate() + 1);
            }
        }

        const delay = nextUpdate.getTime() - now.getTime();
        console.log(`Scheduling next stock price update for ${nextUpdate.toLocaleString()}`);

        updateJob = setTimeout(async () => {
            if (isDuringMarketHours()) {
                console.log('Starting scheduled stock price update');
                await updateAllPrices();
            }
            scheduleNextUpdate();
        }, delay);
    } catch (error) {
        console.error('Error scheduling next update:', error);
        // Retry in 1 hour if there's an error
        updateJob = setTimeout(scheduleNextUpdate, 60 * 60 * 1000);
    }
};

// Initialize the update scheduler
scheduleNextUpdate().catch(console.error);

// Function to update all stock prices
const updateAllPrices = async () => {
    try {
        // Get all unique stock symbols from the database
        const { rows: accounts } = await pool.query(
            `SELECT DISTINCT additional_details->>'symbol' as symbol 
             FROM manual_accounts 
             WHERE type = 'STOCKS'`
        );

        const updates = [];
        for (const account of accounts) {
            const symbol = account.symbol;
            try {
                // Check rate limit
                const recentUpdates = await StockPriceCache.getUpdateCount();
                if (recentUpdates >= RATE_LIMIT.MAX_CALLS_PER_MINUTE) {
                    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT.DELAY_BETWEEN_CALLS));
                }

                const response = await axios.get(
                    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
                );

                if (response.data['Global Quote'] && response.data['Global Quote']['05. price']) {
                    const price = parseFloat(response.data['Global Quote']['05. price']);
                    await StockPriceCache.updatePriceCache(symbol, price);
                    updates.push({ symbol, price, success: true });
                } else {
                    throw new Error('Invalid API response');
                }

                // Respect rate limit
                await new Promise(resolve => setTimeout(resolve, RATE_LIMIT.DELAY_BETWEEN_CALLS));
            } catch (error) {
                console.error(`Error updating ${symbol}:`, error);
                updates.push({ symbol, error: error.message, success: false });
            }
        }

        console.log('Completed stock price updates:', updates);
        return updates;
    } catch (error) {
        console.error('Error in batch update:', error);
        throw error;
    }
};

const getStockPrice = async (req, res) => {
    try {
        const { symbol } = req.params;
        console.log(`Fetching price for symbol: ${symbol}`);
        
        // Check cache first
        const cachedData = await StockPriceCache.getCachedPrice(symbol);
        console.log('Cache check result:', cachedData);
        
        if (cachedData && !StockPriceCache.needsUpdate(cachedData.last_updated)) {
            console.log('Using cached price data');
            return res.json({
                symbol,
                price: parseFloat(cachedData.price),
                timestamp: cachedData.last_updated,
                source: 'cache'
            });
        }

        // Check rate limit before making API call
        const recentUpdates = await StockPriceCache.getUpdateCount();
        console.log('Recent API updates count:', recentUpdates);
        
        if (recentUpdates >= RATE_LIMIT.MAX_CALLS_PER_MINUTE) {
            console.log('Rate limit reached, falling back to cache');
            // If we have cached data, return it even if old
            if (cachedData) {
                return res.json({
                    symbol,
                    price: parseFloat(cachedData.price),
                    timestamp: cachedData.last_updated,
                    source: 'cache (rate limited)'
                });
            }
            throw new Error('Rate limit exceeded. Please try again later.');
        }

        // Fetch from Alpha Vantage
        console.log('Fetching from Alpha Vantage API');
        const response = await axios.get(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
        );
        console.log('Alpha Vantage response:', response.data);

        if (!response.data['Global Quote'] || !response.data['Global Quote']['05. price']) {
            console.log('Invalid API response, falling back to cache');
            // If we have cached data, return it as fallback
            if (cachedData) {
                return res.json({
                    symbol,
                    price: parseFloat(cachedData.price),
                    timestamp: cachedData.last_updated,
                    source: 'cache (API error)'
                });
            }
            throw new Error('Invalid response from Alpha Vantage');
        }

        const price = parseFloat(response.data['Global Quote']['05. price']);
        console.log('Successfully fetched new price:', price);
        
        // Update cache
        await StockPriceCache.updatePriceCache(symbol, price);
        console.log('Cache updated successfully');

        res.json({
            symbol,
            price,
            timestamp: new Date().toISOString(),
            source: 'api'
        });
    } catch (error) {
        console.error('Error fetching stock price:', error);
        console.error('Error details:', error.response?.data || error.message);
        res.status(500).json({
            message: 'Error fetching stock price',
            error: error.message,
            details: error.response?.data
        });
    }
};

// Function to update all stock prices for a user's accounts
const updateAllStockPrices = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Get all stock accounts for the user
        const { rows } = await pool.query(
            `SELECT * FROM manual_accounts 
             WHERE user_id = $1 
             AND type = 'STOCKS'`,
            [userId]
        );

        const updates = [];
        
        for (const account of rows) {
            const symbol = account.additional_details.symbol;
            try {
                // Check cache first
                const cachedData = await StockPriceCache.getCachedPrice(symbol);
                let currentPrice;
                let source;

                if (cachedData && !StockPriceCache.needsUpdate(cachedData.last_updated)) {
                    currentPrice = parseFloat(cachedData.price);
                    source = 'cache';
                } else {
                    // Check rate limit
                    const recentUpdates = await StockPriceCache.getUpdateCount();
                    if (recentUpdates >= RATE_LIMIT.MAX_CALLS_PER_MINUTE) {
                        // Use cached price if available, otherwise skip
                        if (cachedData) {
                            currentPrice = parseFloat(cachedData.price);
                            source = 'cache (rate limited)';
                        } else {
                            updates.push({
                                symbol,
                                error: 'Rate limit exceeded',
                                updated: false
                            });
                            continue;
                        }
                    } else {
                        // Fetch from API
                        const response = await axios.get(
                            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
                        );

                        if (response.data['Global Quote'] && response.data['Global Quote']['05. price']) {
                            currentPrice = parseFloat(response.data['Global Quote']['05. price']);
                            source = 'api';
                            // Update cache
                            await StockPriceCache.updatePriceCache(symbol, currentPrice);
                        } else if (cachedData) {
                            currentPrice = parseFloat(cachedData.price);
                            source = 'cache (API error)';
                        } else {
                            throw new Error('Invalid response from Alpha Vantage');
                        }

                        // Respect rate limit
                        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT.DELAY_BETWEEN_CALLS));
                    }
                }

                // Update account balance
                const shares = account.additional_details.shares;
                const newBalance = currentPrice * shares;

                const updateResult = await pool.query(
                    `UPDATE manual_accounts 
                     SET balance = $1,
                         additional_details = jsonb_set(
                             jsonb_set(additional_details, '{currentPrice}', $2::text::jsonb),
                             '{lastUpdated}', $3::text::jsonb
                         )
                     WHERE id = $4 AND user_id = $5
                     RETURNING *`,
                    [newBalance, JSON.stringify(currentPrice), JSON.stringify(new Date().toISOString()), account.id, userId]
                );

                updates.push({
                    symbol,
                    oldPrice: account.additional_details.currentPrice,
                    newPrice: currentPrice,
                    source,
                    updated: true
                });
            } catch (error) {
                console.error(`Error updating price for ${symbol}:`, error);
                updates.push({
                    symbol,
                    error: error.message,
                    updated: false
                });
            }
        }

        res.json({
            message: 'Stock prices updated',
            updates
        });
    } catch (error) {
        console.error('Error updating stock prices:', error);
        res.status(500).json({
            message: 'Error updating stock prices',
            error: error.message
        });
    }
};

// Add cleanup on process exit
process.on('SIGTERM', () => {
    if (updateJob) {
        clearTimeout(updateJob);
    }
});

module.exports = {
    getStockPrice,
    updateAllStockPrices
}; 