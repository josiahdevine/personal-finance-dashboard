# Development Environment Setup

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git
- PostgreSQL
- Firebase CLI

## Installation Steps

1. Clone the repository
```bash
git clone https://github.com/yourusername/personal-finance-dashboard.git
cd personal-finance-dashboard
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
DATABASE_URL=your_neon_db_url
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
# Add other required variables
```

5. Start the development server
```bash
npm run dev
```

## Development Tools

### Recommended VSCode Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- GitLens

### Code Quality Tools
- ESLint for code linting
- Prettier for code formatting
- Husky for git hooks
- Jest for testing

## Common Issues & Solutions

### Database Connection Issues
[Documentation to be added]

### Firebase Setup Problems
[Documentation to be added]

### Build Errors
[Documentation to be added]

## Next Steps
- Review the [Component Guidelines](../components/guidelines.md)
- Set up the [Database](../database/setup.md)
- Configure [Firebase](../deployment/firebase-setup.md) 