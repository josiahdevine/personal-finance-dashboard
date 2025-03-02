/**
 * Database Optimization API Function
 * Provides endpoints to manage query optimization for Neon Tech PostgreSQL
 */

const corsHandler = require('./utils/cors-handler');
const dbConnector = require('./utils/db-connector');
const queryOptimizer = require('./utils/query-optimizer');
const authHandler = require('./utils/auth-handler');

// Export the handler with authentication middleware
exports.handler = authHandler.requireAuth(async function(event, context) {
  console.log("Received db-optimize request:", {
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

  // Check for authorized methods
  if (!["GET", "POST"].includes(event.httpMethod)) {
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
    
    // Only allow admin users to access optimization functionality
    if (!isAdmin) {
      console.log(`Unauthorized access attempt to db-optimize by user: ${event.user.uid}`);
      return corsHandler.createCorsResponse(403, { 
        error: "Unauthorized. Admin access required." 
      }, origin);
    }
    
    // Parse query parameters and body
    const action = event.queryStringParameters?.action || 'stats';
    let requestBody = {};
    
    if (event.body) {
      try {
        requestBody = JSON.parse(event.body);
      } catch (e) {
        console.error('Error parsing request body:', e);
      }
    }
    
    let response;
    
    // Handle different actions
    switch (action) {
      case 'enable':
        // Enable query optimization
        console.log('Enabling query optimization');
        response = dbConnector.setQueryOptimization(true);
        break;
        
      case 'disable':
        // Disable query optimization
        console.log('Disabling query optimization');
        response = dbConnector.setQueryOptimization(false);
        break;
        
      case 'reset':
        // Reset optimization statistics
        console.log('Resetting query optimization statistics');
        queryOptimizer.resetOptimizationStats();
        response = { success: true, message: 'Optimization statistics reset' };
        break;
        
      case 'analyze':
        // Analyze a specific query
        if (!requestBody.query) {
          return corsHandler.createCorsResponse(400, { 
            error: "Missing required parameter: query" 
          }, origin);
        }
        
        console.log(`Analyzing query: ${requestBody.query.substring(0, 100)}...`);
        response = queryOptimizer.analyzeQuery(requestBody.query, 0);
        break;
        
      case 'stats':
      default:
        // Get optimization statistics
        console.log('Getting query optimization statistics');
        response = {
          success: true,
          stats: queryOptimizer.getOptimizationStats()
        };
        break;
    }
    
    // Return response
    return corsHandler.createCorsResponse(200, response, origin);
  } catch (error) {
    console.error('Error handling database optimization request:', error);
    return corsHandler.createCorsResponse(500, { 
      error: "Failed to process database optimization request",
      message: error.message
    }, origin);
  }
}); 