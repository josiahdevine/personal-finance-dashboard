const log = (message, ...args) => {
    console.log(`[${new Date().toISOString()}] ${message}`, ...args);
};

const logError = (message, error) => {
    console.error(`[${new Date().toISOString()}] ERROR: ${message}`, error);
};

module.exports = { log, logError }; 