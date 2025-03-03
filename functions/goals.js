/**
 * Serverless function for handling financial goals API requests
 */

const corsHandler = require('./utils/cors-handler');
const dbConnector = require('./utils/db-connector');
const authHandler = require('./utils/auth-handler');

// Export the handler with authentication middleware
exports.handler = authHandler.requireAuth(async function(event, context) {
  console.log("Received goals request:", {
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
  
  // Use the authenticated user ID from the auth middleware
  const userId = event.user.uid;
  
  // Define required columns for the financial_goals table
  const requiredColumns = {
    id: 'SERIAL PRIMARY KEY',
    user_id: 'VARCHAR(100) NOT NULL',
    name: 'VARCHAR(200) NOT NULL',
    target_amount: 'DECIMAL(12, 2) NOT NULL',
    current_amount: 'DECIMAL(12, 2) DEFAULT 0',
    start_date: 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
    target_date: 'TIMESTAMP WITH TIME ZONE',
    category: 'VARCHAR(100) DEFAULT \'General\'',
    description: 'TEXT',
    status: 'VARCHAR(50) DEFAULT \'active\'',
    created_at: 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP'
  };

  // Verify and update table schema
  try {
    await dbConnector.verifyTableSchema('financial_goals', requiredColumns);
  } catch (schemaError) {
    console.error("Error verifying schema:", schemaError);
    // Continue processing - the error is logged but we'll still try to handle the request
  }

  // Handle different HTTP methods
  try {
    if (event.httpMethod === "GET") {
      try {
        const result = await dbConnector.query(
          `SELECT * FROM financial_goals WHERE user_id = $1 ORDER BY created_at DESC`,
          [userId]
        );
        
        return corsHandler.createCorsResponse(200, result.rows, origin);
      } catch (dbError) {
        console.error("Database error fetching goals:", dbError);
        
        // Provide mock data for development or if database isn't available
        if (process.env.NODE_ENV !== 'production') {
          console.log("Returning mock goals data for development");
          const mockGoals = [
            {
              id: 1,
              user_id: userId,
              name: "Emergency Fund",
              target_amount: 10000.00,
              current_amount: 5000.00,
              start_date: "2025-01-01T00:00:00Z",
              target_date: "2025-12-31T00:00:00Z",
              category: "Savings",
              description: "Build an emergency fund to cover 6 months of expenses",
              status: "active",
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-02-15T00:00:00Z"
            },
            {
              id: 2,
              user_id: userId,
              name: "New Car",
              target_amount: 25000.00,
              current_amount: 10000.00,
              start_date: "2025-01-01T00:00:00Z",
              target_date: "2026-06-30T00:00:00Z",
              category: "Purchase",
              description: "Save for a new car purchase",
              status: "active",
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-02-15T00:00:00Z"
            },
            {
              id: 3,
              user_id: userId,
              name: "Vacation",
              target_amount: 5000.00,
              current_amount: 2500.00,
              start_date: "2025-01-01T00:00:00Z",
              target_date: "2025-08-31T00:00:00Z",
              category: "Leisure",
              description: "Summer vacation fund",
              status: "active",
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-02-15T00:00:00Z"
            }
          ];
          
          return corsHandler.createCorsResponse(200, mockGoals, origin);
        }
        
        return corsHandler.createCorsResponse(500, {
          error: "Database error",
          message: dbError.message
        }, origin);
      }
    } 
    
    else if (event.httpMethod === "POST") {
      const data = JSON.parse(event.body || '{}');
      
      // Validate required fields
      if (!data.name || !data.targetAmount) {
        return corsHandler.createCorsResponse(400, {
          error: "Bad Request",
          message: "Name and targetAmount are required fields"
        }, origin);
      }
      
      try {
        // Insert the new goal into the database
        const query = `
          INSERT INTO financial_goals 
          (user_id, name, target_amount, current_amount, start_date, target_date, category, description)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `;
        
        const values = [
          userId,
          data.name,
          data.targetAmount,
          data.currentAmount || 0,
          data.startDate || new Date().toISOString(),
          data.targetDate,
          data.category || 'General',
          data.description || ''
        ];
        
        const result = await dbConnector.query(query, values);
        
        return corsHandler.createCorsResponse(201, result.rows[0], origin);
      } catch (dbError) {
        console.error("Database error creating goal:", dbError);
        return corsHandler.createCorsResponse(500, {
          error: "Database error",
          message: dbError.message
        }, origin);
      }
    } 
    
    else if (event.httpMethod === "PUT") {
      const goalId = event.path.split('/').pop();
      const data = JSON.parse(event.body || '{}');
      
      try {
        // First, check if the goal exists and belongs to the user
        const checkResult = await dbConnector.query(
          `SELECT * FROM financial_goals WHERE id = $1 AND user_id = $2`,
          [goalId, userId]
        );
        
        if (checkResult.rowCount === 0) {
          return corsHandler.createCorsResponse(404, {
            error: "Not Found",
            message: "Goal not found or you don't have permission to modify it"
          }, origin);
        }
        
        // Update the goal
        const updateFields = [];
        const values = [goalId, userId];
        let paramIndex = 3;
        
        if (data.name) {
          updateFields.push(`name = $${paramIndex++}`);
          values.push(data.name);
        }
        
        if (data.targetAmount !== undefined) {
          updateFields.push(`target_amount = $${paramIndex++}`);
          values.push(data.targetAmount);
        }
        
        if (data.currentAmount !== undefined) {
          updateFields.push(`current_amount = $${paramIndex++}`);
          values.push(data.currentAmount);
        }
        
        if (data.startDate) {
          updateFields.push(`start_date = $${paramIndex++}`);
          values.push(data.startDate);
        }
        
        if (data.targetDate) {
          updateFields.push(`target_date = $${paramIndex++}`);
          values.push(data.targetDate);
        }
        
        if (data.category) {
          updateFields.push(`category = $${paramIndex++}`);
          values.push(data.category);
        }
        
        if (data.description !== undefined) {
          updateFields.push(`description = $${paramIndex++}`);
          values.push(data.description);
        }
        
        if (data.status) {
          updateFields.push(`status = $${paramIndex++}`);
          values.push(data.status);
        }
        
        // Always update the updated_at timestamp
        updateFields.push(`updated_at = NOW()`);
        
        if (updateFields.length === 0) {
          return corsHandler.createCorsResponse(400, {
            error: "Bad Request",
            message: "No fields to update were provided"
          }, origin);
        }
        
        const query = `
          UPDATE financial_goals 
          SET ${updateFields.join(', ')} 
          WHERE id = $1 AND user_id = $2
          RETURNING *
        `;
        
        const result = await dbConnector.query(query, values);
        
        return corsHandler.createCorsResponse(200, result.rows[0], origin);
      } catch (dbError) {
        console.error("Database error updating goal:", dbError);
        return corsHandler.createCorsResponse(500, {
          error: "Database error",
          message: dbError.message
        }, origin);
      }
    } 
    
    else if (event.httpMethod === "DELETE") {
      const goalId = event.path.split('/').pop();
      
      try {
        // First, check if the goal exists and belongs to the user
        const checkResult = await dbConnector.query(
          `SELECT * FROM financial_goals WHERE id = $1 AND user_id = $2`,
          [goalId, userId]
        );
        
        if (checkResult.rowCount === 0) {
          return corsHandler.createCorsResponse(404, {
            error: "Not Found",
            message: "Goal not found or you don't have permission to delete it"
          }, origin);
        }
        
        // Delete the goal
        await dbConnector.query(
          `DELETE FROM financial_goals WHERE id = $1 AND user_id = $2`,
          [goalId, userId]
        );
        
        return corsHandler.createCorsResponse(204, null, origin);
      } catch (dbError) {
        console.error("Database error deleting goal:", dbError);
        return corsHandler.createCorsResponse(500, {
          error: "Database error",
          message: dbError.message
        }, origin);
      }
    } 
    
    else {
      return corsHandler.createCorsResponse(405, {
        error: "Method Not Allowed",
        message: `The ${event.httpMethod} method is not supported for this endpoint`
      }, origin);
    }
  } catch (error) {
    console.error("Error processing goals request:", error);
    
    return corsHandler.createCorsResponse(500, {
      error: "Internal Server Error",
      message: error.message
    }, origin);
  }
}, { corsHandler }); 