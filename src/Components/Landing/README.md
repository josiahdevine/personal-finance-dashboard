# Landing Page Components

This directory contains components used in the landing page of the personal finance dashboard.

## Components

### DemoChart
An interactive financial visualization component built with Recharts that features:

Data Visualization:
- Six key financial metrics:
  - Savings
  - Investments
  - Expenses
  - Net Worth (calculated)
  - Debt to Income Ratio
  - Savings Rate (%)
- Dynamic date range selection (Week, Month, 3M, 6M, Year)
- Period comparison with percentage changes
- Color-coded metrics visualization

Interactive Features:
- One-click CSV data export
- Period comparison toggle
- Metric selection buttons
- Custom tooltips with detailed metrics
- Responsive design with smooth animations

Technical Features:
- Real-time financial metrics calculation
- CSV data export functionality
- Dynamic period comparison
- Responsive control layout
- Enhanced tooltip information
- Flexible date range selection

Visual Design:
- Color-coded metrics (Blue for savings, Green for investments, Red for expenses, etc.)
- Dashed lines for comparison periods
- Enhanced visualization with increased chart height
- Flexible layout with wrapped controls
- Improved mobile responsiveness

### GuidedDemo
A comprehensive demo account system featuring:
- Three distinct demo account types
- Modal-based credential display
- One-click credential copying with visual feedback
- Animated card interactions and transitions
- Responsive grid layout for demo options

Demo Account Types:
1. Personal Account
   - Email: demo.user@example.com
   - Password: demo123
   - Focus: Personal expense tracking, savings monitoring

2. Small Business Account
   - Email: business.demo@example.com
   - Password: business123
   - Focus: Business finance management, cash flow tracking

3. Investment Portfolio Account
   - Email: investor.demo@example.com
   - Password: invest123
   - Focus: Investment tracking, portfolio analysis

### LandingPage Layout
The main landing page features:
- Fixed-position login form in the top-right corner
- Hero section with animated headings and demo chart
- Features grid with hover animations
- Integration partner showcase
- Demo video section
- User testimonials

## Component Organization

```typescript
// Main landing page structure
import { DemoChart } from './Landing/DemoChart';
import { GuidedDemo } from './Landing/GuidedDemo';
import { Testimonials } from './Landing/Testimonials';
import { IntegrationLogos } from './Landing/IntegrationLogos';
import { DemoVideo } from './Landing/DemoVideo';
```

## Technical Stack

### Core Dependencies
- React 18+
- TypeScript
- Framer Motion (animations)
- Recharts (data visualization)
- Tailwind CSS (styling)
- React Router (navigation)

### Key Features
- Responsive design across all device sizes
- Accessible UI components
- Real-time data simulation
- Smooth transitions and animations
- Secure credential management
- Interactive user interface elements

## Styling Guidelines

### Color Scheme
- Primary: Blue-600 (#2563EB)
- Success: Green-500 (#10B981)
- Error: Red-500 (#EF4444)
- Background: Gray-50 to Blue-50 gradient
- Text: Gray-900 (headers), Gray-500 (body)

### Animation Standards
- Page transitions: 0.5s duration
- Hover effects: 0.2s duration
- Modal transitions: Scale and fade effects
- Chart updates: Smooth transitions between data points

## Best Practices
- Use TypeScript for type safety
- Implement proper error handling
- Maintain responsive design principles
- Follow accessibility guidelines
- Keep components modular and reusable
- Use proper semantic HTML elements
- Implement proper loading states
- Handle edge cases in data visualization

## Dependencies

- React
- Framer Motion (for animations)
- Recharts (for charts)
- Tailwind CSS (for styling)

## Assets

The integration logos are stored in the `public/logos` directory:
- plaid.svg
- neon.svg
- firebase.svg

## Customization

Each component can be customized through props and styling:
- Colors can be adjusted through Tailwind classes
- Animations can be modified through Framer Motion props
- Chart data and styles can be customized in DemoChart
- Demo accounts can be configured in GuidedDemo
- Testimonials can be updated in the testimonials array

## Demo Accounts

The guided demo system includes three types of demo accounts:

1. Personal Account
   - Email: demo.user@example.com
   - Password: demo123
   - Features: Personal expense tracking, savings goals

2. Small Business Account
   - Email: business.demo@example.com
   - Password: business123
   - Features: Business cash flow, expense management

3. Investment Portfolio
   - Email: investor.demo@example.com
   - Password: invest123
   - Features: Advanced portfolio tracking, investment analysis 