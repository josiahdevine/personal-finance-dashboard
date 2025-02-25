# Personal Finance Dashboard

A comprehensive web application for managing personal finances, tracking net worth, and analyzing spending patterns. Built with React, Node.js, and PostgreSQL.

## Features

- **Net Worth Tracking**
  - Connect bank accounts via Plaid API
  - Manual account entry support
  - Historical net worth visualization
  - Asset and liability management

- **Income Management**
  - Salary tracking with tax calculations
  - Support for multiple income sources
  - Automatic paycheck calculations
  - RSU/Stock compensation tracking

- **Expense Analysis**
  - Transaction categorization
  - Spending trends visualization
  - Bill tracking and analysis
  - CSV import support

- **Financial Goals**
  - Goal setting and tracking
  - Progress visualization
  - Category-based organization

## Tech Stack

- **Frontend**: React, Tailwind CSS, Chart.js
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **APIs**: Plaid Integration
- **Authentication**: JWT

## Getting Started

1. Clone the repository
```bash
git clone [repository-url]
cd personal-finance-dashboard
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with:
```
REACT_APP_API_URL=your_api_url
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox
JWT_SECRET=your_jwt_secret
```

4. Start the development server
```bash
npm start
```

## Environment Setup

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL
- Plaid Developer Account

### Database Setup
1. Create a PostgreSQL database
2. Run the migrations:
```bash
npm run migrate
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Plaid API for financial account integration
- Chart.js for data visualization
- Tailwind CSS for styling

# Neon Tech Database Migration

This is a utility script to add all the required columns to the `salary_entries` table in your Neon Tech PostgreSQL database.

## What This Script Does

- Adds all missing columns required by the SalaryController
- Creates compatibility triggers to maintain backward compatibility
- Safely handles existing columns by only adding what's missing
- Shows you the final schema after running the migration

## Setup

1. Copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```

2. Edit the `.env` file and replace the `DATABASE_URL` with your actual Neon Tech connection string.
   You can find this in your Neon dashboard.

3. Install dependencies:
   ```
   npm install
   ```

## Running the Migration

Run the migration script:
```
npm run migrate
```

The script will:
1. Connect to your Neon database
2. Execute the migration SQL script
3. Output the current schema of the `salary_entries` table

## Column Details

This migration adds the following columns to align with your SalaryController:

- user_profile_id (TEXT)
- company (TEXT)
- position (TEXT)
- salary_amount (DECIMAL)
- pay_type (TEXT)
- pay_frequency (TEXT)
- hours_per_week (DECIMAL)
- date (DATE)
- notes (TEXT)
- bonus_amount (DECIMAL)
- bonus_is_percentage (BOOLEAN)
- commission_amount (DECIMAL)
- health_insurance (DECIMAL)
- dental_insurance (DECIMAL)
- vision_insurance (DECIMAL)
- retirement_401k (DECIMAL)
- state (TEXT)
- city (TEXT)

## Backward Compatibility

If your table previously had columns like `amount` or `description`, the script creates triggers to sync between:
- `amount` ↔ `salary_amount`
- `description` ↔ `notes`

This ensures that existing code continues to work while the new controller uses the new column names.
