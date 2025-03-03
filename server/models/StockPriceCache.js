const pool = require('../db');

// Create table for caching stock prices
async function createStockPriceCacheTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS stock_price_cache (
                symbol VARCHAR(10) PRIMARY KEY,
                price DECIMAL(15, 2) NOT NULL,
                last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                update_count INTEGER DEFAULT 1
            );
        `);
        console.log("Stock price cache table created successfully");
    } catch (error) {
        console.error("Error creating stock price cache table:", error);
        throw error;
    }
}

// Create the table when the module is loaded
createStockPriceCacheTable().catch(err => {
    console.error("Failed to create stock price cache table:", err);
    process.exit(1);
});

// Get cached price for a symbol
async function getCachedPrice(symbol) {
    const query = `
        SELECT price, last_updated
        FROM stock_price_cache
        WHERE symbol = $1;
    `;
    const { rows } = await pool.query(query, [symbol.toUpperCase()]);
    return rows[0];
}

// Update or insert price in cache
async function updatePriceCache(symbol, price) {
    const query = `
        INSERT INTO stock_price_cache (symbol, price, last_updated, update_count)
        VALUES ($1, $2, CURRENT_TIMESTAMP, 1)
        ON CONFLICT (symbol) 
        DO UPDATE SET 
            price = $2,
            last_updated = CURRENT_TIMESTAMP,
            update_count = stock_price_cache.update_count + 1;
    `;
    await pool.query(query, [symbol.toUpperCase(), price]);
}

// Check if price needs update (older than 24 hours)
function needsUpdate(lastUpdated) {
    if (!lastUpdated) return true;
    const now = new Date();
    const updated = new Date(lastUpdated);
    const hoursSinceUpdate = (now - updated) / (1000 * 60 * 60);
    return hoursSinceUpdate >= 24;
}

// Get update count for rate limiting
async function getUpdateCount() {
    const query = `
        SELECT COUNT(*) as count
        FROM stock_price_cache
        WHERE last_updated > NOW() - INTERVAL '1 minute';
    `;
    const { rows } = await pool.query(query);
    return parseInt(rows[0].count);
}

module.exports = {
    getCachedPrice,
    updatePriceCache,
    needsUpdate,
    getUpdateCount
}; 