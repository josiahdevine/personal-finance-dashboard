/**
 * Database Metrics API Function
 * Provides monitoring data for the Neon Tech PostgreSQL database
 */

const corsHandler = require('./utils/cors-handler');
const dbConnector = require('./utils/db-connector');
const authHandler = require('./utils/auth-handler');

// Export the handler with authentication middleware
exports.handler = authHandler.requireAuth(async function(event, context) {
  console.log("Received db-metrics request:", {
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

  // Only allow GET requests
  if (event.httpMethod !== "GET") {
    console.log(`Method not allowed: ${event.httpMethod}`);
    return corsHandler.createCorsResponse(405, { 
      error: "Method not allowed" 
    }, origin);
  }

  try {
    // Check if the user has admin role
    const isAdmin = event.user.roles && (
      event.user.roles.includes('admin') || 
      event.user.roles.includes('developer')
    );
    
    // Only allow admin users to access metrics
    if (!isAdmin) {
      console.log(`Unauthorized access attempt to db-metrics by user: ${event.user.uid}`);
      return corsHandler.createCorsResponse(403, { 
        error: "Unauthorized. Admin access required." 
      }, origin);
    }
    
    // Get database metrics
    const metrics = await dbConnector.getDbMetrics();
    
    // Return metrics
    return corsHandler.createCorsResponse(200, metrics, origin);
  } catch (error) {
    console.error('Error retrieving database metrics:', error);
    return corsHandler.createCorsResponse(500, { 
      error: "Failed to retrieve database metrics",
      message: error.message
    }, origin);
  }
}); 