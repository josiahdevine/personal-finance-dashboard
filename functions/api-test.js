/**
 * API Testing Endpoint for Personal Finance Dashboard
 * This function tests various API endpoints and database connections
 * It is intended for development and testing purposes only
 */

const corsHandler = require('./utils/cors-handler');
const dbConnector = require('./utils/db-connector');
const schemaManager = require('./utils/schema-manager');
const authHandler = require('./utils/auth-handler');

// Export the handler with authentication middleware
exports.handler = authHandler.requireAuth(async function(event, context) {
  console.log("Received API test request:", {
    httpMethod: event.httpMethod,
    path: event.path,
    origin: event.headers.origin || event.headers.Origin || '*',
    user: {
      uid: event.user.uid,
      isAuthenticated: event.user.isAuthenticated
    }
  });

  // Get the requesting origin
  const origin = event.headers.origin || event.headers.Origin || '*';

  // Only allow GET requests for testing
  if (event.httpMethod !== "GET") {
    console.log(`Method not allowed: ${event.httpMethod}`);
    return corsHandler.createCorsResponse(405, {
      error: "Method not allowed",
      message: "Only GET requests are allowed for API testing"
    }, origin);
  }

  // Prevent this endpoint from being used in production
  if (process.env.NODE_ENV === 'production' && !event.queryStringParameters?.force === 'true') {
    return corsHandler.createCorsResponse(403, {
      error: "Forbidden",
      message: "API test endpoint is not available in production"
    }, origin);
  }

  try {
    // Test database connection
    const dbTestResults = await testDatabaseConnection();
    
    // Test schema management
    const schemaTestResults = await testSchemaManagement();
    
    // Test data operations for authenticated user
    const userId = event.user.uid;
    const dataTestResults = await testDataOperations(userId);
    
    // Compile test results
    const testResults = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      user: {
        uid: userId,
        isAuthenticated: event.user.isAuthenticated
      },
      database: dbTestResults,
      schema: schemaTestResults,
      data: dataTestResults
    };
    
    return corsHandler.createCorsResponse(200, {
      message: "API test completed",
      results: testResults
    }, origin);
    
  } catch (error) {
    console.error("Error during API test:", error);
    
    return corsHandler.createCorsResponse(500, {
      error: "Test execution failed",
      message: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    }, origin);
  }
}, { corsHandler });

/**
 * Test database connection
 * @returns {Promise<object>} Test results
 */
async function testDatabaseConnection() {
  try {
    // Basic connectivity test
    const startTime = new Date();
    const connResult = await dbConnector.checkDbStatus();
    
    return {
      success: connResult.connected,
      details: connResult,
      duration: (new Date() - startTime) + 'ms'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test schema management
 * @returns {Promise<object>} Test results
 */
async function testSchemaManagement() {
  try {
    // Verify all schemas
    const startTime = new Date();
    const results = await schemaManager.verifyAllSchemas();
    
    return {
      success: results.success,
      details: results.details,
      duration: (new Date() - startTime) + 'ms'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test data operations for a specific user
 * @param {string} userId - The user ID to test with
 * @returns {Promise<object>} Test results
 */
async function testDataOperations(userId) {
  const results = {};
  
  try {
    // Test salary entries
    results.salary_entries = await testSalaryEntries(userId);
    
    // Test financial goals
    results.financial_goals = await testFinancialGoals(userId);
    
    // Overall success is true if all individual tests passed
    const allTestsPassed = Object.values(results).every(result => result.success);
    
    return {
      success: allTestsPassed,
      details: results
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      details: results
    };
  }
}

/**
 * Test salary entries operations
 * @param {string} userId - The user ID to test with
 * @returns {Promise<object>} Test results
 */
async function testSalaryEntries(userId) {
  try {
    // Query to check if we can retrieve salary entries
    const result = await dbConnector.query(
      `SELECT * FROM salary_entries WHERE user_id = $1 LIMIT 5`,
      [userId]
    );
    
    return {
      success: true,
      count: result.rowCount,
      sampleData: result.rowCount > 0 ? result.rows[0] : null
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test financial goals operations
 * @param {string} userId - The user ID to test with
 * @returns {Promise<object>} Test results
 */
async function testFinancialGoals(userId) {
  try {
    // Query to check if we can retrieve financial goals
    const result = await dbConnector.query(
      `SELECT * FROM financial_goals WHERE user_id = $1 LIMIT 5`,
      [userId]
    );
    
    return {
      success: true,
      count: result.rowCount,
      sampleData: result.rowCount > 0 ? result.rows[0] : null
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
} 