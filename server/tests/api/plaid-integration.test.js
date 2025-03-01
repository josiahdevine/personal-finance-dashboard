const { assert } = require('chai');
const { describe, it, before, after, beforeEach } = require('mocha');
const supertest = require('supertest');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const app = require('../../app');
const { createLogger } = require('../../functions/utils/logger');
const { validatePlaidConfig } = require('../../functions/utils/plaid-client');
const db = require('../../db');

// Set test environment
process.env.NODE_ENV = 'test';

const request = supertest(app);
const logger = createLogger('plaid-integration-test');

describe('Plaid API Integration Tests', () => {
    let plaidStub;
    let dbStub;
    let testToken;
    
    before(async () => {
        // Generate test JWT token
        testToken = jwt.sign(
            { userId: 'test-user-id', email: 'test@example.com' },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );

        // Mock database connection
        dbStub = {
            query: sinon.stub().resolves({ rows: [], rowCount: 0 }),
            end: sinon.stub().resolves()
        };
        sinon.stub(db, 'query').callsFake(dbStub.query);
        sinon.stub(db.pool, 'end').callsFake(dbStub.end);
        
        // Create Plaid API stub
        plaidStub = sinon.createStubInstance(PlaidApi);
        app.locals.plaidClient = plaidStub;
    });

    after(async () => {
        sinon.restore();
    });

    beforeEach(() => {
        sinon.resetHistory();
        dbStub.query.resetHistory();
    });

    describe('Token Exchange', () => {
        it('should successfully exchange public token', async () => {
            const mockPublicToken = 'public-sandbox-123';
            const mockAccessToken = 'access-sandbox-456';
            const mockItemId = 'item-sandbox-789';

            plaidStub.itemPublicTokenExchange.resolves({
                data: {
                    access_token: mockAccessToken,
                    item_id: mockItemId
                }
            });

            // Mock database response for token storage
            dbStub.query.resolves({ rows: [{ id: 1 }], rowCount: 1 });

            const response = await request
                .post('/api/plaid/exchange-token')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ public_token: mockPublicToken })
                .expect(200);

            assert.property(response.body, 'success');
            assert.isTrue(response.body.success);
            assert.property(response.body, 'item_id');
            assert.isTrue(dbStub.query.calledOnce);
        });

        it('should handle invalid public token', async () => {
            const mockError = {
                response: {
                    data: {
                        error_type: 'INVALID_INPUT',
                        error_code: 'INVALID_PUBLIC_TOKEN',
                        error_message: 'The public token is invalid'
                    }
                }
            };

            plaidStub.itemPublicTokenExchange.rejects(mockError);

            const response = await request
                .post('/api/plaid/exchange-token')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ public_token: 'invalid-token' })
                .expect(400);

            assert.property(response.body, 'error');
            assert.property(response.body.error, 'code');
            assert.equal(response.body.error.code, 'INVALID_PUBLIC_TOKEN');
            assert.isFalse(dbStub.query.called);
        });

        it('should handle rate limiting', async () => {
            const mockError = {
                response: {
                    status: 429,
                    data: {
                        error_type: 'RATE_LIMIT_EXCEEDED',
                        error_code: 'RATE_LIMIT_EXCEEDED',
                        error_message: 'Too many requests'
                    }
                }
            };

            plaidStub.itemPublicTokenExchange.rejects(mockError);

            const response = await request
                .post('/api/plaid/exchange-token')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ public_token: 'test-token' })
                .expect(429);

            assert.property(response.body, 'error');
            assert.property(response.body.error, 'code');
            assert.equal(response.body.error.code, 'RATE_LIMIT_EXCEEDED');
            assert.isFalse(dbStub.query.called);
        });
    });

    describe('Transaction Syncing', () => {
        it('should sync transactions successfully', async () => {
            plaidStub.transactionsSync.resolves({
                data: {
                    added: [
                        { transaction_id: 'tx1', amount: 100 },
                        { transaction_id: 'tx2', amount: 200 }
                    ],
                    modified: [],
                    removed: [],
                    has_more: false
                }
            });

            const response = await request
                .post('/api/plaid/sync-transactions')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(200);

            assert.property(response.body, 'status');
            assert.equal(response.body.status, 'success');
            assert.property(response.body, 'results');
        });

        it('should handle pagination correctly', async () => {
            plaidStub.transactionsSync.onFirstCall().resolves({
                data: {
                    added: [
                        { transaction_id: 'tx1', amount: 100 },
                        { transaction_id: 'tx2', amount: 200 }
                    ],
                    modified: [],
                    removed: [],
                    has_more: true,
                    next_cursor: 'cursor-123'
                }
            });

            plaidStub.transactionsSync.onSecondCall().resolves({
                data: {
                    added: [],
                    modified: [],
                    removed: [],
                    has_more: false
                }
            });

            const response = await request
                .post('/api/plaid/sync-transactions')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(200);

            assert.property(response.body, 'status');
            assert.equal(response.body.status, 'success');
            assert.property(response.body, 'results');
            assert.equal(response.body.results[0].added, 2);
        });

        it('should handle sync errors gracefully', async () => {
            const mockError = {
                response: {
                    data: {
                        error_type: 'ITEM_LOGIN_REQUIRED',
                        error_code: 'ITEM_LOGIN_REQUIRED',
                        error_message: 'User login required'
                    }
                }
            };

            plaidStub.transactionsSync.rejects(mockError);

            const response = await request
                .post('/api/plaid/sync-transactions')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(400);

            assert.property(response.body.error, 'code');
            assert.equal(response.body.error.code, 'ITEM_LOGIN_REQUIRED');
        });
    });

    describe('Webhook Processing', () => {
        it('should process TRANSACTIONS_REMOVED webhook', async () => {
            const webhookData = {
                webhook_type: 'TRANSACTIONS',
                webhook_code: 'TRANSACTIONS_REMOVED',
                removed_transactions: ['tx1', 'tx2']
            };

            const response = await request
                .post('/api/plaid/webhook')
                .set('Authorization', `Bearer ${testToken}`)
                .set('Plaid-Verification', 'mock-signature')
                .send(webhookData)
                .expect(200);

            assert.property(response.body, 'status');
            assert.equal(response.body.status, 'success');
        });

        it('should process SYNC_UPDATES_AVAILABLE webhook', async () => {
            const webhookData = {
                webhook_type: 'TRANSACTIONS',
                webhook_code: 'SYNC_UPDATES_AVAILABLE',
                item_id: 'item-123'
            };

            const response = await request
                .post('/api/plaid/webhook')
                .set('Authorization', `Bearer ${testToken}`)
                .set('Plaid-Verification', 'mock-signature')
                .send(webhookData)
                .expect(200);

            assert.property(response.body, 'status');
            assert.equal(response.body.status, 'success');
        });

        it('should handle invalid webhook signatures', async () => {
            const webhookData = {
                webhook_type: 'TRANSACTIONS',
                webhook_code: 'SYNC_UPDATES_AVAILABLE',
                item_id: 'item-123'
            };

            const response = await request
                .post('/api/plaid/webhook')
                .set('Authorization', `Bearer ${testToken}`)
                .send(webhookData)
                .expect(401);

            assert.property(response.body.error, 'code');
            assert.equal(response.body.error.code, 'INVALID_SIGNATURE');
        });
    });

    describe('Error Recovery', () => {
        it('should retry on network errors', async () => {
            const mockError = new Error('Network error');
            mockError.code = 'ECONNRESET';

            plaidStub.itemPublicTokenExchange.onFirstCall().rejects(mockError);
            plaidStub.itemPublicTokenExchange.onSecondCall().resolves({
                data: {
                    access_token: 'access-token-123',
                    item_id: 'item-123'
                }
            });

            const response = await request
                .post('/api/plaid/exchange-token')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ public_token: 'test-token' })
                .expect(200);

            assert.property(response.body, 'success');
            assert.isTrue(response.body.success);
        });

        it('should handle rate limit with exponential backoff', async () => {
            const mockError = {
                response: {
                    status: 429,
                    data: {
                        error_type: 'RATE_LIMIT_EXCEEDED',
                        error_code: 'RATE_LIMIT_EXCEEDED',
                        error_message: 'Too many requests',
                        suggested_delay: 1000
                    }
                }
            };

            plaidStub.itemPublicTokenExchange.onFirstCall().rejects(mockError);
            plaidStub.itemPublicTokenExchange.onSecondCall().resolves({
                data: {
                    access_token: 'access-token-123',
                    item_id: 'item-123'
                }
            });

            const response = await request
                .post('/api/plaid/exchange-token')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ public_token: 'test-token' })
                .expect(200);

            assert.property(response.body, 'success');
            assert.isTrue(response.body.success);
        });
    });
}); 