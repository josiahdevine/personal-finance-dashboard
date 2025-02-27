// Salary POST API Function
exports.handler = async function(event, context) {
  console.log("Received salary POST request:", {
    httpMethod: event.httpMethod,
    path: event.path,
    origin: event.headers.origin || event.headers.Origin || '*'
  });

  // Get the requesting origin or default to *
  const origin = event.headers.origin || event.headers.Origin || '*';
  
  // CORS headers for cross-origin requests
  const headers = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Api-Key",
    "Access-Control-Allow-Methods": "POST, PUT, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
    "Content-Type": "application/json"
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    console.log("Handling OPTIONS preflight request for salary POST");
    return {
      statusCode: 204,
      headers,
      body: ""
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST" && event.httpMethod !== "PUT") {
    console.log(`Method not allowed: ${event.httpMethod}`);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    // Parse the authorization header
    const authHeader = event.headers.authorization || event.headers.Authorization;
    console.log("Auth header present:", !!authHeader);
    
    if (!authHeader) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          error: "Unauthorized",
          message: "No authorization token provided"
        })
      };
    }
    
    // Parse the request body
    let salaryData;
    try {
      salaryData = JSON.parse(event.body);
      console.log("Received salary data:", salaryData);
    } catch (err) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Invalid request",
          message: "Failed to parse request body"
        })
      };
    }
    
    // Validate the required fields
    if (!salaryData.date || !salaryData.grossPay) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Invalid request",
          message: "Required fields missing: date and grossPay are required"
        })
      };
    }
    
    // Generate a unique ID for new entries
    const entryId = salaryData.id || `salary-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create a response object with the complete entry
    // In a real implementation, this would be saved to a database
    const savedEntry = {
      id: entryId,
      ...salaryData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Salary entry saved successfully",
        data: savedEntry
      })
    };
  } catch (error) {
    console.error("Error saving salary entry:", error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to save salary entry",
        message: error.message
      })
    };
  }
}; 