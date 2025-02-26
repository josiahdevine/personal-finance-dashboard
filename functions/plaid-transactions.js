// Plaid Transactions API Function
exports.handler = async function(event, context) {
  console.log("Received plaid-transactions request:", {
    httpMethod: event.httpMethod,
    path: event.path,
    origin: event.headers.origin || event.headers.Origin || '*'
  });

  // Get the requesting origin or default to *
  const origin = event.headers.origin || event.headers.Origin || '*';
  
  // CORS headers for cross-origin requests
  const headers = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, Origin",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    "Content-Type": "application/json"
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    console.log("Handling OPTIONS preflight request");
    return {
      statusCode: 204,
      headers,
      body: ""
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== "GET") {
    console.log(`Method not allowed: ${event.httpMethod}`);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    console.log("Processing GET request for plaid transactions");
    // Here you would normally query Plaid for the user's transactions
    // For now, we'll return mock data
    
    // Generate 30 mock transactions for the last 30 days
    const mockCategories = [
      ['Food and Drink', 'Groceries'],
      ['Food and Drink', 'Restaurants'],
      ['Transportation', 'Gas'],
      ['Transportation', 'Public Transit'],
      ['Shopping', 'Clothing'],
      ['Shopping', 'Electronics'],
      ['Bills', 'Utilities'],
      ['Bills', 'Rent'],
      ['Entertainment', 'Movies'],
      ['Entertainment', 'Subscription']
    ];
    
    const mockVendors = [
      'Grocery Store', 'Local Restaurant', 'Gas Station', 'Transit Authority', 
      'Clothing Shop', 'Electronics Store', 'Utility Company', 'Property Management', 
      'Cinema', 'Netflix', 'Amazon', 'Coffee Shop', 'Pharmacy', 'Gym'
    ];
    
    const mockTransactions = Array.from({ length: 30 }, (_, i) => {
      const categoryIndex = Math.floor(Math.random() * mockCategories.length);
      const vendorIndex = Math.floor(Math.random() * mockVendors.length);
      const daysAgo = Math.floor(Math.random() * 30);
      const accountIds = ['mock-account-1', 'mock-account-2', 'mock-account-3'];
      const accountIndex = Math.floor(Math.random() * accountIds.length);
      
      // Most transactions should be negative (expenses)
      const isIncome = Math.random() > 0.85; // 15% chance of being income
      const amount = isIncome 
        ? parseFloat((Math.random() * 1000 + 500).toFixed(2)) 
        : parseFloat(-(Math.random() * 200).toFixed(2));
      
      return {
        transaction_id: `mock-txn-${i}`,
        amount: amount,
        date: new Date(Date.now() - daysAgo * 86400000).toISOString().split('T')[0],
        name: mockVendors[vendorIndex],
        category: mockCategories[categoryIndex],
        account_id: accountIds[accountIndex],
        pending: Math.random() > 0.9 // 10% chance of being pending
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, newest first

    console.log("Returning mock transaction data");
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(mockTransactions)
    };
  } catch (error) {
    console.error("Error fetching Plaid transactions:", error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to fetch transactions",
        message: error.message
      })
    };
  }
}; 