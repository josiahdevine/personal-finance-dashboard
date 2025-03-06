declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_PLAID_CLIENT_ID: string;
    REACT_APP_PLAID_SECRET: string;
    REACT_APP_PLAID_ENV: 'sandbox' | 'development' | 'production';
    REACT_APP_PLAID_PRODUCTS: string;
    REACT_APP_PLAID_COUNTRY_CODES: string;
    REACT_APP_PLAID_REDIRECT_URI: string;
    NODE_ENV: 'development' | 'production' | 'test';
    REACT_APP_API_BASE_URL: string;
    REACT_APP_API_URL: string;
    REACT_APP_FIREBASE_API_KEY: string;
    REACT_APP_FIREBASE_AUTH_DOMAIN: string;
    REACT_APP_FIREBASE_PROJECT_ID: string;
    REACT_APP_FIREBASE_STORAGE_BUCKET: string;
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID: string;
    REACT_APP_FIREBASE_APP_ID: string;
    REACT_APP_FIREBASE_MEASUREMENT_ID: string;
    REACT_APP_STRIPE_PUBLISHABLE_KEY: string;
    REACT_APP_STRIPE_SECRET_KEY: string;
    REACT_APP_ENABLE_ANALYTICS: string;
    REACT_APP_ENABLE_EXPERIMENTAL_FEATURES: string;
  }
} 