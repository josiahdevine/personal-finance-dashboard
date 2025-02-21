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
