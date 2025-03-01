const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const { createLogger } = require('./logger');

const logger = createLogger('plaid-client');

function validatePlaidConfig(config) {
    if (!config.clientId || typeof config.clientId !== 'string') {
        logger.error('Invalid Plaid client ID');
        return false;
    }

    if (!config.secret || typeof config.secret !== 'string') {
        logger.error('Invalid Plaid secret');
        return false;
    }

    const validEnvs = ['sandbox', 'development', 'production'];
    if (!config.env || !validEnvs.includes(config.env)) {
        logger.error('Invalid Plaid environment');
        return false;
    }

    return true;
}

function createPlaidClient(config) {
    if (!validatePlaidConfig(config)) {
        throw new Error('Invalid Plaid configuration');
    }

    const configuration = new Configuration({
        basePath: PlaidEnvironments[config.env],
        baseOptions: {
            headers: {
                'PLAID-CLIENT-ID': config.clientId,
                'PLAID-SECRET': config.secret,
            },
            timeout: 10000,
        },
    });

    return new PlaidApi(configuration);
}

module.exports = {
    validatePlaidConfig,
    createPlaidClient
}; 