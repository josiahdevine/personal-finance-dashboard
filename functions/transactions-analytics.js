/**
 * Transactions Analytics API
 * Provides analytics data for user transactions
 */

import { createCorsResponse, handleOptionsRequest } from './utils/cors-handler.js';
import { verifyAuthToken } from './utils/auth-handler.js';

/**
 * Generate mock analytics data for development
 * @param {string} userId - The user ID to generate data for
 * @returns {object} Mock analytics data
 */
function generateMockAnalyticsData(userId) {
  // Categories for spending analysis
  const categories = [
    'Food & Dining', 
    'Shopping', 
    'Housing', 
    'Transportation', 
    'Entertainment', 
    'Health & Fitness',
    'Travel',
    'Education',
    'Personal Care',
    'Investments'
  ];
  
  // Generate random spending by category
  const categorySpending = categories.map(category => ({
    category,
    amount: Math.floor(Math.random() * 1000) + 50,
    count: Math.floor(Math.random() * 20) + 1
  }));
  
  // Sort by amount descending
  categorySpending.sort((a, b) => b.amount - a.amount);
  
  // Generate monthly spending data (last 6 months)
  const monthlySpending = [];
  const currentDate = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const month = new Date(currentDate);
    month.setMonth(currentDate.getMonth() - i);
    
    monthlySpending.push({
      month: month.toISOString().substring(0, 7), // YYYY-MM format
      spending: Math.floor(Math.random() * 3000) + 1000,
      income: Math.floor(Math.random() * 5000) + 3000
    });
  }
  
  // Calculate totals
  const totalSpending = categorySpending.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = monthlySpending.reduce((sum, item) => sum + item.income, 0);
  const savingsRate = Math.round(((totalIncome - totalSpending) / totalIncome) * 100);
  
  return {
    userId,
    summary: {
      totalSpending,
      totalIncome,
      savingsRate,
      transactionCount: categorySpending.reduce((sum, item) => sum + item.count, 0),
      averageTransaction: Math.round(totalSpending / categorySpending.reduce((sum, item) => sum + item.count, 0))
    },
    categoryBreakdown: categorySpending,
    monthlyTrends: monthlySpending,
    topMerchants: [
      { name: 'Amazon', amount: Math.floor(Math.random() * 500) + 100, count: Math.floor(Math.random() * 10) + 1 },
      { name: 'Walmart', amount: Math.floor(Math.random() * 400) + 50, count: Math.floor(Math.random() * 8) + 1 },
      { name: 'Target', amount: Math.floor(Math.random() * 300) + 50, count: Math.floor(Math.random() * 6) + 1 },
      { name: 'Starbucks', amount: Math.floor(Math.random() * 200) + 20, count: Math.floor(Math.random() * 15) + 1 },
      { name: 'Uber', amount: Math.floor(Math.random() * 150) + 30, count: Math.floor(Math.random() * 5) + 1 }
    ]
  };
}

/**
 * Netlify serverless function handler for transactions analytics
 */
export const handler = async (event, context) => {
  // Log request details for debugging
  console.log('Transactions Analytics Request:', {
    method: event.httpMethod,
    path: event.path,
    origin: event.headers.origin || event.headers.Origin,
    queryParams: event.queryStringParameters
  });
  
  // Handle OPTIONS request (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest(event);
  }
  
  // Get request origin for CORS
  const origin = event.headers.origin || event.headers.Origin;
  
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return createCorsResponse(405, { error: 'Method not allowed' }, origin);
  }
  
  try {
    // Verify authentication
    const user = await verifyAuthToken(event);
    if (!user) {
      return createCorsResponse(401, { error: 'Unauthorized' }, origin);
    }
    
    // Log authenticated user
    console.log('Authenticated user:', {
      userId: user.uid,
      email: user.email
    });
    
    // Get query parameters
    const { timeframe = 'month', category } = event.queryStringParameters || {};
    
    // In a real implementation, we would query the database for actual analytics
    // For now, generate mock data
    const analyticsData = generateMockAnalyticsData(user.uid);
    
    // Filter data based on query parameters if needed
    if (category) {
      analyticsData.categoryBreakdown = analyticsData.categoryBreakdown.filter(
        item => item.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Return successful response with analytics data
    return createCorsResponse(200, analyticsData, origin);
  } catch (error) {
    // Log error details
    console.error('Error in transactions analytics:', error);
    
    // Return error response
    return createCorsResponse(500, { 
      error: 'Internal server error',
      message: error.message
    }, origin);
  }
}; 