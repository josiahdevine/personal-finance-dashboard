/**
 * Transactions Analytics API
 * Provides aggregated transaction data for charts and analytics
 */

const corsHandler = require('./utils/cors-handler');
const authHandler = require('./utils/auth-handler');
const { logInfo, logError } = require('./utils/logger');

exports.handler = async function(event, context) {
  // Get the requesting origin
  const origin = event.headers.origin || event.headers.Origin || '*';
  
  // Handle preflight requests
  const preflightResponse = corsHandler.handleCorsPreflightRequest(event);
  if (preflightResponse) return preflightResponse;

  // Log the request
  logInfo('transactions-analytics', 'Received request', {
    path: event.path,
    method: event.httpMethod,
    origin: origin,
    queryParams: event.queryStringParameters || {}
  });

  try {
    // Verify authentication
    const user = await authHandler.verifyUser(event);
    if (!user) {
      return corsHandler.createCorsResponse(401, {
        error: 'Unauthorized',
        message: 'Authentication required'
      }, origin);
    }

    // Get query parameters
    const { startDate, endDate, categories } = event.queryStringParameters || {};
    
    // Generate mock analytics data for now
    // In a real implementation, this would query the database
    const analyticsData = generateMockAnalytics(startDate, endDate, categories);
    
    // Return the analytics data
    return corsHandler.createCorsResponse(200, analyticsData, origin);
  } catch (error) {
    logError('transactions-analytics', 'Error processing request', error);
    
    return corsHandler.createCorsResponse(500, {
      error: 'Internal Server Error',
      message: 'An error occurred while processing your request',
      requestId: context.awsRequestId
    }, origin);
  }
};

/**
 * Generate mock analytics data
 * @param {string} startDate - Start date for filtering
 * @param {string} endDate - End date for filtering
 * @param {string} categories - Comma-separated list of categories to include
 * @returns {object} Mock analytics data
 */
function generateMockAnalytics(startDate, endDate, categories) {
  // Parse categories if provided
  const categoryFilter = categories ? categories.split(',') : null;
  
  // Generate category breakdown
  const categoryBreakdown = [
    { category: 'Food & Dining', amount: 1250.75 },
    { category: 'Shopping', amount: 875.32 },
    { category: 'Transportation', amount: 450.18 },
    { category: 'Bills & Utilities', amount: 1100.45 },
    { category: 'Entertainment', amount: 325.67 },
    { category: 'Travel', amount: 750.89 },
    { category: 'Health & Fitness', amount: 225.43 },
    { category: 'Other', amount: 175.21 }
  ];
  
  // Generate monthly spending data
  const monthlySpending = [
    { month: 'Jan', amount: 3250.45 },
    { month: 'Feb', amount: 2950.32 },
    { month: 'Mar', amount: 3100.78 },
    { month: 'Apr', amount: 3450.21 },
    { month: 'May', amount: 3200.65 },
    { month: 'Jun', amount: 3600.12 }
  ];
  
  // Calculate totals
  const totalExpenses = categoryBreakdown.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = 5500.00; // Mock income value
  
  return {
    categoryBreakdown: categoryFilter 
      ? categoryBreakdown.filter(item => categoryFilter.includes(item.category))
      : categoryBreakdown,
    monthlySpending,
    totalIncome,
    totalExpenses,
    netCashFlow: totalIncome - totalExpenses,
    period: {
      startDate: startDate || '2023-01-01',
      endDate: endDate || new Date().toISOString().split('T')[0]
    }
  };
} 