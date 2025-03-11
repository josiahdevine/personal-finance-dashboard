/**
 * @file Type System Documentation
 * 
 * This file contains comprehensive documentation for the type system used in the personal finance dashboard.
 * It includes detailed explanations of types, their relationships, and usage guidelines.
 */

/**
 * Core Types
 * ----------
 * 
 * @typedef {string} UUID - Universally Unique Identifier in standard format
 * Example: "123e4567-e89b-12d3-a456-426614174000"
 * 
 * @typedef {string} ISO8601DateTime - Date and time in ISO 8601 format
 * Example: "2025-03-10T13:24:19-04:00"
 * 
 * @typedef {('USD'|'EUR'|'GBP'|'CAD')} Currency - Supported currency codes
 * 
 * @typedef {('1d'|'1w'|'1m'|'3m'|'6m'|'1y'|'5y'|'all')} TimeFrame - Time periods for data analysis
 */

// Types declared for documentation purposes only
export interface DocTypes {
  UUID: string;
  ISO8601DateTime: string;
  Currency: 'USD' | 'EUR' | 'GBP' | 'CAD';
  TimeFrame: '1d' | '1w' | '1m' | '3m' | '6m' | '1y' | '5y' | 'all';
}

/**
 * User & Authentication
 * --------------------
 * 
 * @interface User
 * Represents a user in the system with authentication and preference data
 * @property {string} uid - Unique identifier from authentication provider
 * @property {string} email - User's email address
 * @property {string} displayName - User's display name
 * @property {string} [photoURL] - Optional URL to user's profile photo
 * @property {boolean} emailVerified - Whether email has been verified
 * @property {ISO8601DateTime} [createdAt] - Account creation timestamp
 * @property {ISO8601DateTime} [updatedAt] - Last account update timestamp
 * @property {UserPreferences} [preferences] - User preferences
 * @property {string[]} [permissions] - User permissions
 * 
 * @interface UserPreferences
 * User-specific settings and preferences
 * @property {('light'|'dark'|'system')} theme - UI theme preference
 * @property {Currency} currency - Preferred currency for display
 * @property {NotificationPreferences} notifications - Notification settings
 * @property {string} defaultDashboard - Default dashboard view
 */

/**
 * Financial Data
 * -------------
 * 
 * @interface Account
 * Represents a financial account
 * @property {UUID} id - Unique identifier
 * @property {UUID} userId - Owner's user ID
 * @property {string} name - Account name
 * @property {AccountType} type - Account type
 * @property {AccountSubtype} [subtype] - Optional account subtype
 * @property {number} balance - Current balance
 * @property {Currency} currency - Account currency
 * @property {Institution} institution - Associated financial institution
 * @property {string} [mask] - Last 4 digits or similar identifier
 * @property {boolean} isActive - Whether account is active
 * @property {ISO8601DateTime} [lastSync] - Last sync timestamp
 * @property {ISO8601DateTime} createdAt - Creation timestamp
 * @property {ISO8601DateTime} updatedAt - Last update timestamp
 * 
 * @interface Transaction
 * Represents a financial transaction
 * @property {UUID} id - Unique identifier
 * @property {UUID} accountId - Associated account ID
 * @property {UUID} userId - Owner's user ID
 * @property {ISO8601DateTime} date - Transaction date
 * @property {number} amount - Transaction amount
 * @property {Currency} currency - Transaction currency
 * @property {string} description - Transaction description
 * @property {TransactionCategory} category - Transaction category
 * @property {TransactionType} type - Transaction type
 * @property {TransactionStatus} status - Transaction status
 * @property {string} [merchantName] - Optional merchant name
 * @property {string} [merchantLogo] - Optional merchant logo URL
 * @property {TransactionLocation} [location] - Optional transaction location
 * @property {string[]} [tags] - Optional transaction tags
 * @property {string} [notes] - Optional user notes
 * @property {ISO8601DateTime} createdAt - Creation timestamp
 * @property {ISO8601DateTime} updatedAt - Last update timestamp
 */

/**
 * Budget & Planning
 * ----------------
 * 
 * @interface Budget
 * Represents a budget plan
 * @property {UUID} id - Unique identifier
 * @property {UUID} userId - Owner's user ID
 * @property {string} name - Budget name
 * @property {number} amount - Budget amount
 * @property {Currency} currency - Budget currency
 * @property {BudgetPeriod} period - Budget period
 * @property {UUID} [categoryId] - Optional category ID
 * @property {ISO8601DateTime} startDate - Budget start date
 * @property {ISO8601DateTime} [endDate] - Optional end date
 * @property {boolean} isRecurring - Whether budget recurs
 * @property {boolean} notifications - Whether notifications are enabled
 * @property {ISO8601DateTime} createdAt - Creation timestamp
 * @property {ISO8601DateTime} updatedAt - Last update timestamp
 * 
 * @interface BudgetProgress
 * Represents budget progress tracking
 * @property {number} spent - Amount spent
 * @property {number} remaining - Amount remaining
 * @property {number} percentage - Percentage of budget used
 * @property {BudgetStatus} status - Budget status
 * @property {Transaction[]} transactions - Related transactions
 */

/**
 * Analytics & Insights
 * -------------------
 * 
 * @interface CashFlowPrediction
 * Represents a cash flow prediction
 * @property {ISO8601DateTime} date - Prediction date
 * @property {number} amount - Predicted amount
 * @property {boolean} isProjected - Whether this is a projection
 * @property {number} confidence - Confidence score (0-1)
 * @property {CashFlowFactor[]} factors - Contributing factors
 * 
 * @interface CashFlowFactor
 * Represents a factor affecting cash flow
 * @property {('income'|'expense'|'recurring'|'seasonal')} type - Factor type
 * @property {number} impact - Impact on prediction (-1 to 1)
 * @property {string} description - Factor description
 */

/**
 * UI Components
 * ------------
 * 
 * @interface TimeFrameOption
 * Represents a time frame selection option
 * @property {string} label - Display label
 * @property {TimeFrame} value - Time frame value
 * 
 * @interface ChartDataPoint
 * Represents a data point in charts
 * @property {ISO8601DateTime} date - Data point date
 * @property {number} value - Data point value
 * @property {string} [label] - Optional label
 * @property {string} [category] - Optional category
 * @property {boolean} [isProjected] - Whether point is projected
 * 
 * @interface Badge
 * Represents a UI badge
 * @property {string|number} content - Badge content
 * @property {('primary'|'secondary'|'danger'|'warning'|'success')} variant - Badge style
 */

/**
 * Common Component Props
 * ---------------------
 * 
 * @interface BaseComponentProps
 * Base props for all components
 * @property {string} [className] - Optional CSS class
 * @property {React.CSSProperties} [style] - Optional inline styles
 * @property {string} [testId] - Optional test ID
 * 
 * @interface LoadingProps
 * Props for loading components
 * @extends BaseComponentProps
 * @property {('small'|'medium'|'large')} [size] - Loading indicator size
 * @property {string} [message] - Loading message
 * 
 * @interface ErrorProps
 * Props for error components
 * @extends BaseComponentProps
 * @property {string} message - Error message
 * @property {string} [code] - Error code
 * @property {() => void} [retry] - Retry callback
 */

/**
 * API Responses
 * ------------
 * 
 * @interface ApiResponse<T>
 * Generic API response wrapper
 * @template T - Response data type
 * @property {T} [data] - Response data
 * @property {ApiError} [error] - Error details
 * @property {ApiMeta} [meta] - Response metadata
 * 
 * @interface ApiError
 * API error details
 * @property {string} code - Error code
 * @property {string} message - Error message
 * @property {unknown} [details] - Additional error details
 * 
 * @interface ApiMeta
 * API response metadata
 * @property {number} [page] - Current page number
 * @property {number} [limit] - Page size limit
 * @property {number} [total] - Total number of items
 * @property {boolean} [hasMore] - Whether more items exist
 */

/**
 * Usage Guidelines
 * ---------------
 * 
 * 1. Type Guards
 *    - Use type guards from guards.ts for runtime type checking
 *    - Example: if (isUUID(id)) { ... }
 * 
 * 2. Validation
 *    - Use validators from guards.ts for API response validation
 *    - Example: if (validateUser(data)) { ... }
 * 
 * 3. Component Props
 *    - Extend BaseComponentProps for consistent component interfaces
 *    - Example: interface MyProps extends BaseComponentProps { ... }
 * 
 * 4. API Responses
 *    - Use ApiResponse<T> for consistent API response handling
 *    - Example: const response: ApiResponse<User> = await api.getUser()
 * 
 * 5. Date Handling
 *    - Always use ISO8601DateTime for dates
 *    - Example: createdAt: "2025-03-10T13:24:19-04:00"
 * 
 * 6. Currency
 *    - Always specify currency with amounts
 *    - Example: { amount: 100, currency: 'USD' }
 */

// Export empty object to make this a module
export {};
