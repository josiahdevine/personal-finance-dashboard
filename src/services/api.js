import axios from 'axios';
import { getAuth } from 'firebase/auth';

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

// Get the current port from the window location
const _getCurrentPort = () => {
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

// Determine the base URL based on environment
// Make sure we don't have a doubled path by removing any existing /.netlify/functions
const API_BASE_URL = (() => {
  let baseUrl = process.env.REACT_APP_API_BASE_URL || 
    (window.location.hostname === 'localhost' 
      ? `http://localhost:8889/.netlify/functions`
      : '/.netlify/functions');
      
  // Ensure we don't have doubled paths
  if (baseUrl.includes('/.netlify/functions/.netlify/functions')) {
    baseUrl = baseUrl.replace('/.netlify/functions/.netlify/functions', '/.netlify/functions');
  }
  
  console.log('API Base URL:', baseUrl);  
  return baseUrl;
})();

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  withCredentials: true, // Always send credentials for CORS
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for detailed logging
api.interceptors.request.use(request => {
  console.log('🚀 API Request:', {
    url: request.url,
    method: request.method,
    headers: request.headers,
    data: request.data,
    baseURL: request.baseURL,
    withCredentials: request.withCredentials
  });
  return request;
}, error => {
  console.error('❌ Request Error:', error);
  return Promise.reject(error);
});

// Add response interceptor for detailed logging
api.interceptors.response.use(response => {
  console.log('✅ API Response:', {
    url: response.config.url,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    data: response.data
  });
  return response;
}, error => {
  console.error('❌ Response Error:', {
    url: error.config?.url,
    message: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data
  });
  return Promise.reject(error);
});

// Log API initialization for debugging
console.log('[API] Client initialized with:', {
  baseURL: api.defaults.baseURL,
  environment: process.env.NODE_ENV,
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown'
});

/* Health check runs only once at startup. Automatic retries are not implemented to avoid blocking the event loop. */
api.checkHealth = async () => {
  try {
    const response = await api.get('/health-check');
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
    // Make an actual call to the backend login endpoint
    const response = await api.post('/auth-login', userData);
    console.log('Backend login response:', response.data);
    return response.data;
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

// Function to disable mock data usage
const _shouldUseMockData = () => {
  return false; // Always use real data
};

// Mock API response handler
const _handleMockResponse = async (config) => {
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

// Request interceptor for adding auth token and logging
api.interceptors.request.use(
  async (config) => {
    try {
      // Get current user from Firebase Auth
      const auth = getAuth();
      const user = auth.currentUser;
      
      // If user is authenticated, add token to headers
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log outgoing request (without sensitive data)
      console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, {
        withCredentials: config.withCredentials,
        baseURL: config.baseURL,
        headers: {
          ...config.headers,
          Authorization: config.headers.Authorization ? '[REDACTED]' : undefined
        }
      });
      
      return config;
    } catch (error) {
      console.error('Error in API request interceptor:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
api.interceptors.response.use(
  (response) => {
    // Log successful response (without sensitive data)
    console.log(`API Response: ${response.status} ${response.config.url}`, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
    
    return response;
  },
  (error) => {
    // Handle CORS errors specifically
    if (error.message && error.message.includes('Network Error')) {
      console.error('CORS Error detected:', error);
      return Promise.reject({
        ...error,
        isCorsError: true,
        message: 'Network error: This may be due to CORS restrictions. Please check console for details.'
      });
    }
    
    // Log error response
    console.error('API Error Response:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        withCredentials: error.config?.withCredentials,
        headers: {
          ...error.config?.headers,
          Authorization: error.config?.headers?.Authorization ? '[REDACTED]' : undefined
        }
      }
    });
    
    return Promise.reject(error);
  }
);

export default api; 