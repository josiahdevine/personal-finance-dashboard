/**
 * Database Backup API Function
 * Provides endpoints to create, list, and restore database backups
 */

import corsHandler from './utils/cors-handler.js';
import dbBackup from './utils/db-backup.js';
import authHandler from './utils/auth-handler.js';

// Export the handler with authentication middleware
export const handler = authHandler.requireAuth(async function(event, context) {
  console.log("Received db-backup request:", {
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
    
    // Only allow admin users to access backup functionality
    if (!isAdmin) {
      console.log(`Unauthorized access attempt to db-backup by user: ${event.user.uid}`);
      return corsHandler.createCorsResponse(403, { 
        error: "Unauthorized. Admin access required." 
      }, origin);
    }
    
    // Parse query parameters and body
    const action = event.queryStringParameters?.action || 'list';
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
      case 'create':
        // Create a new backup
        console.log('Creating database backup');
        const tables = requestBody.tables || null;
        response = await dbBackup.createBackup(tables);
        break;
        
      case 'restore':
        // Restore from a backup
        if (!requestBody.filename) {
          return corsHandler.createCorsResponse(400, { 
            error: "Missing required parameter: filename" 
          }, origin);
        }
        
        console.log(`Restoring database from backup: ${requestBody.filename}`);
        response = await dbBackup.restoreBackup(
          requestBody.filename,
          requestBody.tables || null
        );
        break;
        
      case 'list':
      default:
        // List available backups
        console.log('Listing database backups');
        response = {
          success: true,
          backups: dbBackup.listBackups()
        };
        break;
    }
    
    // Return response
    return corsHandler.createCorsResponse(200, response, origin);
  } catch (error) {
    console.error('Error handling database backup request:', error);
    return corsHandler.createCorsResponse(500, { 
      error: "Failed to process database backup request",
      message: error.message
    }, origin);
  }
}); 