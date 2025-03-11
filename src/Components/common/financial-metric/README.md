# FinancialMetric Component

A reusable component for displaying financial metrics with optional change indicators.

## Features

- Display a labeled financial value
- Format values as currency, percentage, or plain numbers
- Show change indicators (up/down arrows) with percentage change
- Customizable styling through class names

## Usage

```jsx
import FinancialMetric from './components/common/financial-metric/FinancialMetric';

// Basic usage
<FinancialMetric 
  label="Total Balance" 
  value={1000} 
/>

// With change indicator
<FinancialMetric 
  label="Monthly Income" 
  value={1500} 
  previousValue={1200} 
/>

// As percentage
<FinancialMetric 
  label="Growth Rate" 
  value={7.5} 
  formatType="percentage" 
/>

// With custom class
<FinancialMetric 
  label="Revenue" 
  value={5000} 
  className="custom-class" 
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | (required) | The label for the metric |
| `value` | number | (required) | The current value to display |
| `previousValue` | number | undefined | Previous value used to calculate change percentage |
| `formatType` | 'currency' \| 'percentage' \| 'number' | 'currency' | How to format the value |
| `currency` | string | 'USD' | Currency code for formatting when `formatType` is 'currency' |
| `className` | string | '' | Additional CSS class names |

## Styling

The component uses the following CSS classes that can be customized:

- `.financial-metric` - The container element
- `.financial-metric-label` - The label element
- `.financial-metric-value` - The value element
- `.financial-metric-change` - The change indicator element
- `.financial-metric-change.positive` - Positive change indicator
- `.financial-metric-change.negative` - Negative change indicator
- `.financial-metric-change.neutral` - Neutral change indicator (no change)

## Testing

The component has been manually tested and verified to work correctly. A manual test script is available at:

```
src/components/common/financial-metric/manual-test.js
```

To run the manual test:

```
node src/components/common/financial-metric/manual-test.js
```

## Dependencies

- React
- formatCurrency and formatPercentage functions from utils/formatters 