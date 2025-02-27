/**
 * Serverless function for handling financial goals API requests
 */

const { Pool } = require('pg');

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Export the handler function for Netlify Functions
exports.handler = async function(event, context) {
  console.log("Received goals request:", {
    httpMethod: event.httpMethod,
    path: event.path,
    origin: event.headers.origin || event.headers.Origin || '*',
    query: event.queryStringParameters
  });

  // Get the requesting origin or default to *
  const origin = event.headers.origin || event.headers.Origin || '*';
  
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Api-Key",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
    "Content-Type": "application/json"
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    console.log("Handling OPTIONS preflight request for goals endpoint");
    return {
      statusCode: 204,
      headers,
      body: ""
    };
  }

  // Authentication - extract and validate token
  let userId = null;
  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // In a real app, validate this token
      const token = authHeader.substring(7);
      // This is a simplified version - in production you'd verify the JWT
      userId = token.split('.')[1]; // Extract user ID from token payload
      
      if (!userId) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ 
            error: "Unauthorized", 
            message: "Invalid authentication token" 
          })
        };
      }
    } else {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          error: "Unauthorized", 
          message: "Authentication token is required" 
        })
      };
    }
  } catch (error) {
    console.error("Error authenticating request:", error);
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({
        error: "Authentication failed",
        message: error.message
      })
    };
  }

  // Handle different HTTP methods
  try {
    const client = await pool.connect();
    
    if (event.httpMethod === "GET") {
      try {
        const result = await client.query(
          `SELECT * FROM financial_goals WHERE user_id = $1 ORDER BY created_at DESC`,
          [userId]
        );
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result.rows)
        };
      } catch (dbError) {
        console.error("Database error fetching goals:", dbError);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: "Database error",
            message: dbError.message
          })
        };
      } finally {
        client.release();
      }
    } 
    
    else if (event.httpMethod === "POST") {
      const data = JSON.parse(event.body || '{}');
      
      // Validate required fields
      if (!data.name || !data.targetAmount) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: "Bad Request",
            message: "Name and targetAmount are required fields"
          })
        };
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
        
        const result = await client.query(query, values);
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(result.rows[0])
        };
      } catch (dbError) {
        console.error("Database error creating goal:", dbError);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: "Database error",
            message: dbError.message
          })
        };
      } finally {
        client.release();
      }
    } 
    
    else if (event.httpMethod === "PUT") {
      const goalId = event.path.split('/').pop();
      const data = JSON.parse(event.body || '{}');
      
      if (!goalId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: "Bad Request",
            message: "Goal ID is required"
          })
        };
      }
      
      try {
        // Update the goal in the database
        const query = `
          UPDATE financial_goals
          SET 
            name = COALESCE($1, name),
            target_amount = COALESCE($2, target_amount),
            current_amount = COALESCE($3, current_amount),
            target_date = COALESCE($4, target_date),
            category = COALESCE($5, category),
            description = COALESCE($6, description),
            updated_at = NOW()
          WHERE id = $7 AND user_id = $8
          RETURNING *
        `;
        
        const values = [
          data.name,
          data.targetAmount,
          data.currentAmount,
          data.targetDate,
          data.category,
          data.description,
          goalId,
          userId
        ];
        
        const result = await client.query(query, values);
        
        if (result.rows.length === 0) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
              error: "Not Found",
              message: "Goal not found or you don't have permission to update it"
            })
          };
        }
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result.rows[0])
        };
      } catch (dbError) {
        console.error("Database error updating goal:", dbError);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: "Database error",
            message: dbError.message
          })
        };
      } finally {
        client.release();
      }
    } 
    
    else if (event.httpMethod === "DELETE") {
      const goalId = event.path.split('/').pop();
      
      if (!goalId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: "Bad Request",
            message: "Goal ID is required"
          })
        };
      }
      
      try {
        // Delete the goal from the database
        const query = `
          DELETE FROM financial_goals
          WHERE id = $1 AND user_id = $2
          RETURNING id
        `;
        
        const result = await client.query(query, [goalId, userId]);
        
        if (result.rows.length === 0) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
              error: "Not Found",
              message: "Goal not found or you don't have permission to delete it"
            })
          };
        }
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            id: result.rows[0].id,
            deleted: true
          })
        };
      } catch (dbError) {
        console.error("Database error deleting goal:", dbError);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: "Database error",
            message: dbError.message
          })
        };
      } finally {
        client.release();
      }
    } 
    
    else {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({
          error: "Method Not Allowed",
          message: `The ${event.httpMethod} method is not supported for this endpoint`
        })
      };
    }
  } catch (error) {
    console.error("Error processing goals request:", error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal Server Error",
        message: error.message
      })
    };
  }
}; 