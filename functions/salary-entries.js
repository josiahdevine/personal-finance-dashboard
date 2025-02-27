// Salary Entries API Function
exports.handler = async function(event, context) {
  console.log("Received salary-entries request:", {
    httpMethod: event.httpMethod,
    path: event.path,
    origin: event.headers.origin || event.headers.Origin || '*',
    query: event.queryStringParameters
  });

  // Get the requesting origin or default to *
  const origin = event.headers.origin || event.headers.Origin || '*';
  
  // CORS headers for cross-origin requests
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
    console.log("Handling OPTIONS preflight request for salary-entries");
    return {
      statusCode: 204,
      headers,
      body: ""
    };
  }

  // Check for authorized methods
  if (!["GET", "POST", "PUT", "DELETE"].includes(event.httpMethod)) {
    console.log(`Method not allowed: ${event.httpMethod}`);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    console.log(`Processing ${event.httpMethod} request for salary entries`);
    
    // Parse the authorization header
    const authHeader = event.headers.authorization || event.headers.Authorization;
    console.log("Auth header present:", !!authHeader);
    
    // Get user profile ID from query parameters
    const userProfileId = event.queryStringParameters?.userProfileId || 'primary';
    console.log(`Fetching salary data for user profile: ${userProfileId}`);
    
    // Generate mock salary entries data
    const mockSalaryEntries = [
      {
        id: '1',
        userProfileId: 'primary',
        date: '2025-02-15',
        grossPay: 5000.00,
        netPay: 3750.00,
        taxes: 1000.00,
        deductions: 250.00,
        details: {
          federalTax: 800.00,
          stateTax: 200.00,
          socialSecurity: 310.00,
          medicare: 72.50,
          retirement401k: 250.00,
          healthInsurance: 0.00
        }
      },
      {
        id: '2',
        userProfileId: 'primary',
        date: '2025-01-31',
        grossPay: 5000.00,
        netPay: 3750.00,
        taxes: 1000.00,
        deductions: 250.00,
        details: {
          federalTax: 800.00,
          stateTax: 200.00,
          socialSecurity: 310.00,
          medicare: 72.50,
          retirement401k: 250.00,
          healthInsurance: 0.00
        }
      },
      {
        id: '3',
        userProfileId: 'primary',
        date: '2025-01-15',
        grossPay: 5000.00,
        netPay: 3750.00,
        taxes: 1000.00,
        deductions: 250.00,
        details: {
          federalTax: 800.00,
          stateTax: 200.00,
          socialSecurity: 310.00,
          medicare: 72.50,
          retirement401k: 250.00,
          healthInsurance: 0.00
        }
      }
    ];
    
    // Filter entries by user profile ID if needed
    const filteredEntries = mockSalaryEntries.filter(entry => entry.userProfileId === userProfileId);

    console.log(`Returning ${filteredEntries.length} mock salary entries`);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(filteredEntries)
    };
  } catch (error) {
    console.error("Error handling salary entries:", error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to handle salary entries request",
        message: error.message
      })
    };
  }
}; 