/**
 * Health check endpoint for the Personal Finance Dashboard API
 * This function checks the overall health of the system, including:
 * - API connectivity
 * - Database connectivity
 * - Environment variables
 */

const corsHandler = require('./utils/cors-handler');
const dbConnector = require('./utils/db-connector');
const schemaManager = require('./utils/schema-manager');

exports.handler = async function(event, context) {
  console.log("Received health-check request:", {
    httpMethod: event.httpMethod,
    path: event.path,
    origin: event.headers.origin || event.headers.Origin || '*'
  });

  // Handle CORS preflight
  const preflightResponse = corsHandler.handleCorsPreflightRequest(event);
  if (preflightResponse) {
    return preflightResponse;
  }

  // Get the requesting origin
  const origin = event.headers.origin || event.headers.Origin || '*';

  // Only allow GET requests
  if (event.httpMethod !== "GET") {
    console.log(`Method not allowed: ${event.httpMethod}`);
    return corsHandler.createCorsResponse(405, {
      error: "Method not allowed"
    }, origin);
  }

  try {
    // Check database connection
    const dbStatus = await dbConnector.checkDbStatus();
    
    // Verify all schemas
    const schemaStatus = await schemaManager.verifyAllSchemas();
    
    // Get table counts
    const tableStats = {};
    for (const tableName of Object.keys(schemaManager.tableSchemas)) {
      try {
        const result = await dbConnector.query(`SELECT COUNT(*) FROM ${tableName}`);
        tableStats[tableName] = parseInt(result.rows[0].count);
      } catch (error) {
        tableStats[tableName] = `Error: ${error.message}`;
      }
    }
    
    // Prepare response
    const response = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        connection: dbStatus,
        schemas: schemaStatus,
        tables: tableStats
      },
      environment: process.env.NODE_ENV || 'development'
    };

    // If database is not connected, mark overall status as degraded
    if (dbStatus.connected === false) {
      response.status = "degraded";
    }

    return corsHandler.createCorsResponse(200, response, origin);
  } catch (error) {
    console.error("Health check error:", error);
    
    return corsHandler.createCorsResponse(500, {
      status: "error",
      error: "Failed to check system health",
      message: error.message
    }, origin);
  }
}; 