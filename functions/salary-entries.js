/**
 * Salary Entries API Function
 * Retrieves salary entries for the authenticated user
 */

const corsHandler = require('./utils/cors-handler');
const dbConnector = require('./utils/db-connector');
const authHandler = require('./utils/auth-handler');

// Export the handler with authentication middleware
exports.handler = authHandler.requireAuth(async function(event, context) {
  console.log("Received salary-entries request:", {
    httpMethod: event.httpMethod,
    path: event.path,
    origin: event.headers.origin || event.headers.Origin || '*',
    query: event.queryStringParameters,
    user: {
      uid: event.user.uid,
      isAuthenticated: event.user.isAuthenticated
    }
  });

  // Get the requesting origin
  const origin = event.headers.origin || event.headers.Origin || '*';

  // Check for authorized methods
  if (!["GET", "POST", "PUT", "DELETE"].includes(event.httpMethod)) {
    console.log(`Method not allowed: ${event.httpMethod}`);
    return corsHandler.createCorsResponse(405, { 
      error: "Method not allowed" 
    }, origin);
  }

  try {
    console.log(`Processing ${event.httpMethod} request for salary entries`);
    
    // Use the authenticated user ID from the auth middleware
    const userId = event.user.uid;
    
    // Get user profile ID from query parameters
    const userProfileId = event.queryStringParameters?.userProfileId || 'primary';
    console.log(`Fetching salary data for user profile: ${userProfileId}, user: ${userId}`);

    // Define required columns for the salary_entries table
    const requiredColumns = {
      id: 'VARCHAR(36) PRIMARY KEY',
      user_id: 'VARCHAR(100) NOT NULL',
      user_profile_id: 'VARCHAR(50) NOT NULL',
      date: 'DATE NOT NULL',
      gross_pay: 'DECIMAL(10, 2) NOT NULL',
      net_pay: 'DECIMAL(10, 2) NOT NULL',
      taxes: 'DECIMAL(10, 2) NOT NULL',
      deductions: 'DECIMAL(10, 2) NOT NULL',
      details: 'JSONB',
      created_at: 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
      updated_at: 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP'
    };

    // Verify and create the table if it doesn't exist
    const schemaResult = await dbConnector.verifyTableSchema('salary_entries', requiredColumns);
    if (!schemaResult.success) {
      console.error("Failed to verify database schema:", schemaResult.error);
      return corsHandler.createCorsResponse(500, {
        error: "Database schema verification failed",
        message: schemaResult.error
      }, origin);
    }

    // Attempt to query the database
    const result = await dbConnector.query(
      `SELECT * FROM salary_entries WHERE user_id = $1 AND user_profile_id = $2 ORDER BY date DESC`,
      [userId, userProfileId]
    );

    console.log(`Found ${result.rowCount} salary entries in database`);
    
    // Transform database rows to application format
    const salaryEntries = result.rows.map(row => ({
      id: row.id,
      userProfileId: row.user_profile_id,
      date: row.date,
      grossPay: parseFloat(row.gross_pay),
      netPay: parseFloat(row.net_pay),
      taxes: parseFloat(row.taxes),
      deductions: parseFloat(row.deductions),
      details: row.details || {
        federalTax: 0,
        stateTax: 0,
        socialSecurity: 0,
        medicare: 0,
        retirement401k: 0,
        healthInsurance: 0
      }
    }));

    return corsHandler.createCorsResponse(200, salaryEntries, origin);
  } catch (error) {
    console.error("Error handling salary entries:", error);
    
    return corsHandler.createCorsResponse(500, {
      error: "Failed to handle salary entries request",
      message: error.message
    }, origin);
  }
}, { corsHandler }); 