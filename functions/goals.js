/**
 * Serverless function for handling financial goals API requests
 */

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
  
  // CORS headers - ensure they match exactly what's in the netlify.toml file
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

  // Mock authentication check - in a real implementation, validate the token
  // This would typically extract the user ID from a JWT token
  let userId = 'demo-user';
  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // In a real app, validate this token
      const token = authHeader.substring(7);
      // For demo, we'll just extract a mock user ID
      userId = token.split('.')[0] || 'demo-user';
    }
  } catch (error) {
    console.error("Error parsing auth token:", error);
  }

  // Handle different HTTP methods
  try {
    if (event.httpMethod === "GET") {
      // Mock goals data for demo purposes
      // In production, you would fetch this from your database
      const mockGoals = [
        {
          id: "goal-1",
          name: "Emergency Fund",
          targetAmount: 10000,
          currentAmount: 5000,
          startDate: "2023-01-01",
          targetDate: "2023-12-31",
          category: "Savings",
          description: "Build an emergency fund for unexpected expenses"
        },
        {
          id: "goal-2",
          name: "Vacation",
          targetAmount: 3000,
          currentAmount: 1200,
          startDate: "2023-02-15",
          targetDate: "2023-08-15",
          category: "Travel",
          description: "Save for a summer vacation"
        },
        {
          id: "goal-3",
          name: "New Car Down Payment",
          targetAmount: 5000,
          currentAmount: 2500,
          startDate: "2023-03-01",
          targetDate: "2024-03-01",
          category: "Transportation",
          description: "Save for a down payment on a new car"
        }
      ];
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(mockGoals)
      };
    } 
    
    else if (event.httpMethod === "POST") {
      // Create a new goal
      // In production, you would save this to your database
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
      
      // Mock response - in production, this would be the saved goal with an ID
      const newGoal = {
        id: `goal-${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString()
      };
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(newGoal)
      };
    } 
    
    else if (event.httpMethod === "PUT") {
      // Update an existing goal
      // In production, you would update this in your database
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
      
      // Mock response
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          id: goalId,
          ...data,
          updatedAt: new Date().toISOString()
        })
      };
    } 
    
    else if (event.httpMethod === "DELETE") {
      // Delete a goal
      // In production, you would delete this from your database
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
      
      // Mock response
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          id: goalId,
          deleted: true
        })
      };
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