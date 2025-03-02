import axios from 'axios';
import { getToken } from './auth';

// Mock data for development mode
const MOCK_DATA = {
  '/api/plaid/accounts': {
    items: [
      {
        id: 'mock-item-1',
        institution_name: 'Mock Bank',
        institution_id: 'ins_mock',
        accounts: [
          {
            account_id: 'mock-account-1',
            name: 'Mock Checking',
            official_name: 'CHECKING ACCOUNT',
            type: 'depository',
            subtype: 'checking',
            mask: '1234',
            current_balance: 5432.10,
            available_balance: 5400.00
          },
          {
            account_id: 'mock-account-2',
            name: 'Mock Savings',
            official_name: 'SAVINGS ACCOUNT',
            type: 'depository',
            subtype: 'savings',
            mask: '5678',
            current_balance: 12345.67,
            available_balance: 12345.67
          }
        ]
      },
      {
        id: 'mock-item-2',
        institution_name: 'Mock Credit Union',
        institution_id: 'ins_mock2',
        accounts: [
          {
            account_id: 'mock-account-3',
            name: 'Mock Credit Card',
            official_name: 'PLATINUM CREDIT CARD',
            type: 'credit',
            subtype: 'credit card',
            mask: '9012',
            current_balance: -2540.15,
            available_balance: 7459.85,
            limit: 10000
          }
        ]
      }
    ],
    balances: [
      {
        account_id: 'mock-account-1',
        account_name: 'Mock Checking',
        account_type: 'checking',
        current_balance: 5432.10,
        institution_name: 'Mock Bank'
      },
      {
        account_id: 'mock-account-2',
        account_name: 'Mock Savings',
        account_type: 'savings',
        current_balance: 12345.67,
        institution_name: 'Mock Bank'
      },
      {
        account_id: 'mock-account-3',
        account_name: 'Mock Credit Card',
        account_type: 'credit card',
        current_balance: -2540.15,
        institution_name: 'Mock Credit Union'
      }
    ]
  },
  '/api/plaid/transactions': generateMockTransactions(),
  '/api/accounts': {
    netWorth: 100000,
    salary: 75000,
    location: 'New York',
    accountTypes: ['Checking', 'Savings', 'Investment', 'Credit Card'],
    loans: [
      { type: 'Mortgage', amount: 300000, rate: 3.5 },
      { type: 'Car Loan', amount: 20000, rate: 4.5 }
    ],
    investments: [
      { type: 'Stocks', value: 50000 },
      { type: '401k', value: 100000 }
    ],
    recentTransactions: [
      { name: 'Grocery Store', amount: -120.50, date: '2023-05-10' },
      { name: 'Restaurant', amount: -45.80, date: '2023-05-08' },
      { name: 'Gas Station', amount: -35.25, date: '2023-05-05' }
    ]
  },
  '/api/salary/entries': {
    entries: generateMockSalaryEntries()
  },
  '/api/goals': [
    {
      id: 'goal-1',
      name: 'Emergency Fund',
      current: 5000,
      target: 10000,
      deadline: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
      progress: 50
    },
    {
      id: 'goal-2',
      name: 'Vacation Fund',
      current: 2000,
      target: 3000,
      deadline: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
      progress: 66.7
    },
    {
      id: 'goal-3',
      name: 'Down Payment',
      current: 15000,
      target: 60000,
      deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString(),
      progress: 25
    }
  ]
};

// Helper function to generate mock transactions
function generateMockTransactions() {
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
  
  // Generate 30 mock transactions for the last 30 days
  return Array.from({ length: 30 }, (_, i) => {
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
}

// Helper function to generate mock salary entries
function generateMockSalaryEntries() {
  const today = new Date();
  const entries = [];
  
  // Generate entries for past 6 months
  for (let i = 0; i < 6; i++) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - i);
    
    entries.push({
      id: `mock-salary-${i}`,
      userId: 'current-user',
      date: date.toISOString().split('T')[0],
      grossPay: 6250, // $75k annual salary
      netPay: 4625, // After taxes and deductions
      federalTax: 1000,
      stateTax: 350,
      socialSecurity: 387.50,
      medicare: 90.63,
      retirement401k: 625, // 10% contribution
      healthInsurance: 200,
      dentalInsurance: 50,
      visionInsurance: 25,
      otherDeductions: 0,
      notes: 'Regular paycheck'
    });
  }
  
  return entries;
}

// Set to true to use mock data even in production (for demo purposes)
const USE_MOCK_DATA = false;

// Get the current port from the window location
const getCurrentPort = () => {
  if (typeof window !== 'undefined') {
    // For development, check if we're running on localhost
    if (window.location.hostname === 'localhost') {
      // Try to get the port from environment variable first
      const envPort = process.env.REACT_APP_API_PORT || process.env.PORT;
      if (envPort) return envPort;
      
      // If no environment port, use the current window port
      return window.location.port || '5000'; // Default to 5000 if no port specified
    }
    return window.location.port; // Use actual port in production
  }
  return '5000'; // Default fallback
};

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.trypersonalfinance.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Required for CORS with credentials
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Log API initialization for debugging
console.log('[API] Client initialized with:', {
  baseURL: api.defaults.baseURL,
  environment: process.env.NODE_ENV,
  hostname: window.location.hostname
});

// Add a simple health check function to test API connectivity
api.checkHealth = async () => {
  try {
    const response = await api.get('/health');
    console.log('API health check successful:', response.data);
    return { status: 'healthy', data: response.data };
  } catch (error) {
    console.error('API health check failed:', error);
    return { status: 'unhealthy', error: error.message };
  }
};

// Add login method for backend authentication
api.login = async (userData) => {
  try {
    // In a real implementation, this would call the backend
    // For now, we'll just mock a successful response
    console.log('Mock backend login with:', userData);
    
    // Simulate successful backend authentication
    return {
      success: true,
      userId: userData.firebaseUid,
      token: 'mock-auth-token-' + Date.now()
    };
  } catch (error) {
    console.error('Backend login failed:', error);
    throw error;
  }
};

// Check health on initialization in non-production environments
if (process.env.NODE_ENV !== 'production') {
  api.checkHealth().then(result => {
    if (result.status === 'unhealthy') {
      console.warn('⚠️ API health check failed - some features may not work properly');
    }
  });
}

// Check if we're in development mode or using mock data intentionally
const shouldUseMockData = () => {
  return process.env.NODE_ENV === 'development' || USE_MOCK_DATA;
};

// Mock API response handler
const handleMockResponse = async (config) => {
  console.log('Using mock data for:', config.url);
  
  // Extract the endpoint path from the URL
  let endpoint = config.url;
  if (endpoint.includes('?')) {
    endpoint = endpoint.split('?')[0];
  }
  
  // Find the matching mock data
  let mockDataResponse = null;
  
  // Look for exact endpoint match
  if (MOCK_DATA[endpoint]) {
    mockDataResponse = MOCK_DATA[endpoint];
  } else {
    // Look for partial matches (for endpoints with parameters)
    for (const key of Object.keys(MOCK_DATA)) {
      if (endpoint.startsWith(key)) {
        mockDataResponse = MOCK_DATA[key];
        break;
      }
    }
  }
  
  if (mockDataResponse) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return a successful response with the mock data
    return {
      data: mockDataResponse,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      request: {}
    };
  }
  
  // If no mock data found, return a 404 error
  console.warn('No mock data found for:', endpoint);
  const error = new Error('Not Found');
  error.response = {
    data: { message: 'No mock data available for this endpoint' },
    status: 404,
    statusText: 'Not Found',
    headers: {},
    config,
    request: {}
  };
  throw error;
};

// Add request interceptor to handle auth
api.interceptors.request.use(
  (config) => {
    // Get auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('[API] Response error:', error.response.status, error.response.data);
      if (error.response.status === 401) {
        // Handle unauthorized access
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('[API] Network error:', error.request);
    } else {
      // Error in request configuration
      console.error('[API] Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api; 