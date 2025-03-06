# Finance Intelligence Suite - Comprehensive UI Enhancement Strategy

## 1. Design Language Foundation

### 1.1 Core Design Principles

#### 1.1.1 Visual Identity
- **Clean & Minimal**: Implement a restrained aesthetic with ample whitespace
- **Data-Forward**: Prioritize financial data visualization with clear information hierarchy
- **Intuitive Interaction**: Create discoverable features with minimal learning curve
- **Depth & Dimension**: Use subtle shadows and layering for visual hierarchy
- **Motion with Purpose**: Implement animations that enhance understanding of financial data

#### 1.1.2 Spatial System
- Base grid of 8px (0.5rem) for all spacing, padding, and margins
- Consistent spacing scales:
  ```css
  --space-xs: 0.25rem;  /* 4px */
  --space-sm: 0.5rem;   /* 8px */
  --space-md: 1rem;     /* 16px */
  --space-lg: 1.5rem;   /* 24px */
  --space-xl: 2rem;     /* 32px */
  --space-2xl: 3rem;    /* 48px */
  --space-3xl: 4rem;    /* 64px */
  ```
- Responsive breakpoints:
  ```css
  --breakpoint-xs: 20rem;   /* 320px - Small mobile */
  --breakpoint-sm: 30rem;   /* 480px - Mobile */
  --breakpoint-md: 48rem;   /* 768px - Tablet */
  --breakpoint-lg: 64rem;   /* 1024px - Desktop */
  --breakpoint-xl: 80rem;   /* 1280px - Large desktop */
  --breakpoint-2xl: 96rem;  /* 1536px - Extra large desktop */
  ```

#### 1.1.3 Elevation System
- 5-level elevation system with progressively increasing shadow values:
  ```css
  --elevation-1: 0 1px 2px rgba(0, 0, 0, 0.05);
  --elevation-2: 0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.07);
  --elevation-3: 0 4px 8px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.07);
  --elevation-4: 0 8px 16px rgba(0, 0, 0, 0.05), 0 4px 8px rgba(0, 0, 0, 0.07);
  --elevation-5: 0 16px 32px rgba(0, 0, 0, 0.05), 0 8px 16px rgba(0, 0, 0, 0.07);
  ```

### 1.2 Color System

#### 1.2.1 Primary Palette
- **Brand Primary**: `#3366FF` - Inspired by SoFi's trusted blue
- **Brand Secondary**: `#00C48C` - Success/positive green similar to Robinhood
- **Brand Accent**: `#FF6B6B` - Warning/attention red
- **Neutral Light**: `#F7F9FC` - Background for light mode

#### 1.2.2 Extended Palette
- **Brand Primary Shades**:
  ```css
  --blue-50: #E6EEFF;
  --blue-100: #C2D4FF;
  --blue-200: #99B3FF;
  --blue-300: #6690FF;
  --blue-400: #3366FF; /* Primary */
  --blue-500: #1A4DFF;
  --blue-600: #0033CC;
  --blue-700: #002299;
  --blue-800: #001166;
  --blue-900: #000033;
  ```

- **Success Shades**:
  ```css
  --green-50: #E6FAF5;
  --green-100: #B3F1E3;
  --green-200: #80E9D2;
  --green-300: #4DE0C0;
  --green-400: #00C48C; /* Secondary */
  --green-500: #00A376;
  --green-600: #008260;
  --green-700: #006249;
  --green-800: #004133;
  --green-900: #00201A;
  ```

- **Warning Shades**:
  ```css
  --red-50: #FFEAEA;
  --red-100: #FFCCCC;
  --red-200: #FFADAD;
  --red-300: #FF8D8D;
  --red-400: #FF6B6B; /* Accent */
  --red-500: #FF4747;
  --red-600: #E60000;
  --red-700: #B30000;
  --red-800: #800000;
  --red-900: #4D0000;
  ```

- **Neutral Shades**:
  ```css
  --neutral-50: #F7F9FC; /* Background Light */
  --neutral-100: #EAF0F7;
  --neutral-200: #DCE3ED;
  --neutral-300: #C8D3E5;
  --neutral-400: #A3B4CC;
  --neutral-500: #8295B3;
  --neutral-600: #61759A;
  --neutral-700: #465A7D;
  --neutral-800: #304060;
  --neutral-900: #1A2643;
  ```

#### 1.2.3 Dark Mode Palette
- **Background Dark**: `#1A1F36`
- **Surface Dark**: `#252D43`
- **Text on Dark**: `#E4E9F2`

#### 1.2.4 Semantic Color Tokens
```css
/* Light Mode */
:root {
  --color-background-primary: var(--neutral-50);
  --color-background-secondary: white;
  --color-background-tertiary: var(--neutral-100);
  
  --color-surface-primary: white;
  --color-surface-secondary: var(--neutral-50);
  --color-surface-tertiary: var(--neutral-100);
  
  --color-text-primary: var(--neutral-900);
  --color-text-secondary: var(--neutral-700);
  --color-text-tertiary: var(--neutral-500);
  --color-text-inverse: white;
  
  --color-border-light: var(--neutral-200);
  --color-border-medium: var(--neutral-300);
  --color-border-heavy: var(--neutral-400);
  
  --color-action-primary: var(--blue-400);
  --color-action-primary-hover: var(--blue-500);
  --color-action-primary-active: var(--blue-600);
  
  --color-action-secondary: var(--neutral-200);
  --color-action-secondary-hover: var(--neutral-300);
  --color-action-secondary-active: var(--neutral-400);
  
  --color-positive: var(--green-400);
  --color-positive-light: var(--green-50);
  --color-negative: var(--red-400);
  --color-negative-light: var(--red-50);
  --color-warning: #FFAA00;
  --color-warning-light: #FFF8E6;
  --color-info: var(--blue-400);
  --color-info-light: var(--blue-50);
}

/* Dark Mode */
[data-theme="dark"] {
  --color-background-primary: var(--neutral-900);
  --color-background-secondary: #1A1F36;
  --color-background-tertiary: #252D43;
  
  --color-surface-primary: #252D43;
  --color-surface-secondary: #2D3452;
  --color-surface-tertiary: #3A4061;
  
  --color-text-primary: var(--neutral-50);
  --color-text-secondary: var(--neutral-200);
  --color-text-tertiary: var(--neutral-400);
  --color-text-inverse: var(--neutral-900);
  
  --color-border-light: #3A4061;
  --color-border-medium: #465A7D;
  --color-border-heavy: #61759A;
  
  --color-action-primary: var(--blue-400);
  --color-action-primary-hover: var(--blue-300);
  --color-action-primary-active: var(--blue-200);
  
  --color-action-secondary: #3A4061;
  --color-action-secondary-hover: #465A7D;
  --color-action-secondary-active: #61759A;
  
  /* Maintain consistent semantic colors */
  --color-positive: var(--green-400);
  --color-positive-light: rgba(0, 196, 140, 0.15);
  --color-negative: var(--red-400);
  --color-negative-light: rgba(255, 107, 107, 0.15);
  --color-warning: #FFAA00;
  --color-warning-light: rgba(255, 170, 0, 0.15);
  --color-info: var(--blue-400);
  --color-info-light: rgba(51, 102, 255, 0.15);
}
```

#### 1.2.5 Financial Data Color System
- **Investment Type Colors**:
  - Stocks: `#3366FF`
  - Bonds: `#8295B3`
  - Cash: `#00C48C`
  - Real Estate: `#FFAA00`
  - Crypto: `#9966FF`
  - Commodities: `#FF6B6B`

- **Performance Colors**:
  - Strong Positive: `#00A376`
  - Positive: `#00C48C`
  - Neutral: `#8295B3`
  - Negative: `#FF6B6B`
  - Strong Negative: `#E60000`

### 1.3 Typography System

#### 1.3.1 Font Families
```css
:root {
  --font-family-sans: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --font-family-mono: "SF Mono", "Roboto Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
}
```

#### 1.3.2 Type Scale
```css
:root {
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */
  --text-6xl: 3.75rem;   /* 60px */
  
  /* Line heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
  
  /* Letter spacing */
  --tracking-tighter: -0.05em;
  --tracking-tight: -0.025em;
  --tracking-normal: 0em;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
  --tracking-widest: 0.1em;
  
  /* Font weights */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

#### 1.3.3 Typography Components
```typescript
// Heading component
interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  tracking?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';
  align?: 'left' | 'center' | 'right';
  color?: string;
  children: React.ReactNode;
}

// Text component
interface TextProps {
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  leading?: 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
  align?: 'left' | 'center' | 'right';
  color?: string;
  truncate?: boolean;
  children: React.ReactNode;
}

// Financial figure component for currency and percentages
interface FinancialFigureProps {
  value: number;
  format: 'currency' | 'percentage' | 'number';
  currency?: string;
  variant?: 'positive' | 'negative' | 'neutral';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  showIcon?: boolean;
}
```

### 1.4 Iconography System

#### 1.4.1 Icon Library
- Create comprehensive financial icon set with consistent styling:
  - Navigation icons
  - Action icons
  - Financial category icons
  - Status indicators
  - Chart type icons

#### 1.4.2 Icon Component
```typescript
interface IconProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}

const iconSizes = {
  xs: '1rem',    /* 16px */
  sm: '1.25rem', /* 20px */
  md: '1.5rem',  /* 24px */
  lg: '2rem',    /* 32px */
  xl: '2.5rem',  /* 40px */
};
```

#### 1.4.3 Financial Category Icons
- Implement consistent icons for transaction categories:
  - Housing: House icon
  - Transportation: Car icon
  - Food: Fork and knife icon
  - Utilities: Lightbulb icon
  - Entertainment: Film icon
  - Shopping: Shopping bag icon
  - Healthcare: Heart or medical cross icon
  - Personal: Person icon
  - Income: Wallet or money icon
  - Investments: Chart icon

## 2. Core Component System

### 2.1 Button System

#### 2.1.1 Button Base Component
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success' | 'text';
  size: 'xs' | 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isFullWidth?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
}
```

#### 2.1.2 Button Variants

**Primary Button**
- Background: `--color-action-primary`
- Text: White
- Hover: `--color-action-primary-hover`
- Active: `--color-action-primary-active`
- Border: None
- Shadow: `--elevation-1`

**Secondary Button**
- Background: White
- Text: `--color-text-primary`
- Border: `--color-border-medium`
- Hover: `--color-action-secondary-hover`
- Shadow: `--elevation-1`

**Tertiary Button**
- Background: Transparent
- Text: `--color-action-primary`
- Border: None
- Hover: `--color-action-secondary`

**Danger Button**
- Background: `--color-negative`
- Text: White
- Hover: Darker red
- Border: None
- Shadow: `--elevation-1`

**Success Button**
- Background: `--color-positive`
- Text: White
- Hover: Darker green
- Border: None
- Shadow: `--elevation-1`

**Text Button**
- Background: Transparent
- Text: `--color-action-primary`
- Hover: `--color-action-secondary`
- Border: None

#### 2.1.3 Button Sizes and Padding
```css
.button-xs {
  padding: 0.25rem 0.5rem;
  font-size: var(--text-xs);
  border-radius: 0.25rem;
}

.button-sm {
  padding: 0.5rem 0.75rem;
  font-size: var(--text-sm);
  border-radius: 0.375rem;
}

.button-md {
  padding: 0.625rem 1rem;
  font-size: var(--text-base);
  border-radius: 0.5rem;
}

.button-lg {
  padding: 0.75rem 1.25rem;
  font-size: var(--text-lg);
  border-radius: 0.5rem;
}
```

#### 2.1.4 Button States
- **Default**: Standard styling
- **Hover**: Color change, slight shadow increase
- **Focus**: Focus ring with brand color
- **Active**: Slightly darker color, subtle inset shadow
- **Disabled**: Reduced opacity, no hover effects
- **Loading**: Spinner icon, reduced opacity

#### 2.1.5 Button Animation
- Subtle hover transition for color and shadow (150ms ease)
- Click animation with slight scale reduction (scale: 0.98)
- Loading spinner animation (rotation)

### 2.2 Input Components

#### 2.2.1 Text Input
```typescript
interface TextInputProps {
  type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
  errorText?: string;
  isInvalid?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  autoFocus?: boolean;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}
```

**Text Input Styling**
- Border: `--color-border-medium`
- Border Radius: 0.5rem
- Background: White (light mode) / `--color-surface-secondary` (dark mode)
- Focus: Border color change to `--color-action-primary`
- Invalid: Border color change to `--color-negative`
- Disabled: Reduced opacity, light background
- Transition: Border and background colors (150ms ease)

#### 2.2.2 Select Input
```typescript
interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  options: SelectOption[];
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  isInvalid?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isMulti?: boolean;
}
```

**Select Input Styling**
- Similar to Text Input
- Custom dropdown styling
- Option hover state
- Selected option highlighting
- Multiple selection with chips/tags

#### 2.2.3 Number/Currency Input
```typescript
interface CurrencyInputProps {
  value: number | string;
  onChange: (value: number) => void;
  label?: string;
  placeholder?: string;
  currency?: string;
  precision?: number;
  helperText?: string;
  errorText?: string;
  isInvalid?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  size?: 'sm' | 'md' | 'lg';
  min?: number;
  max?: number;
  step?: number;
}
```

**Currency Input Features**
- Automatic formatting with currency symbol
- Right-aligned text (convention for numbers)
- Thousands separators
- Decimal precision control
- Increment/decrement buttons (optional)

#### 2.2.4 Date Input
```typescript
interface DateInputProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  isInvalid?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  format?: string;
  minDate?: Date;
  maxDate?: Date;
  size?: 'sm' | 'md' | 'lg';
  showCalendarIcon?: boolean;
}
```

**Date Input Features**
- Calendar dropdown
- Date format customization
- Range selection support
- Keyboard navigation
- Year and month quick selection

### 2.3 Card Components

#### 2.3.1 Base Card
```typescript
interface CardProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevation?: 1 | 2 | 3 | 4 | 5;
  border?: boolean;
  borderRadius?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
  width?: string;
  height?: string;
  onClick?: () => void;
  isInteractive?: boolean;
}
```

**Card Styling**
- Background: `--color-surface-primary`
- Border Radius: 1rem (default)
- Shadow: Based on elevation prop
- Border: Optional 1px `--color-border-light`
- Padding: Based on padding prop
- Transition: Shadow and transform for hover state
- Interactive: Cursor pointer, hover/active states

#### 2.3.2 Account Card
```typescript
interface AccountCardProps {
  accountName: string;
  accountType: string;
  balance: number;
  currency?: string;
  institution?: string;
  institutionLogo?: string;
  lastFour?: string;
  trend?: number;
  trendPeriod?: string;
  onClick?: () => void;
  isSelected?: boolean;
}
```

**Account Card Styling**
- SoFi-inspired clean design
- Institution logo or icon
- Balance with large type
- Trend indicator with up/down arrows and colors
- Subtle hover effect
- Selected state with highlight border

#### 2.3.3 Transaction Card
```typescript
interface TransactionCardProps {
  merchant: string;
  amount: number;
  currency?: string;
  date: Date;
  category: string;
  categoryIcon?: string;
  pending?: boolean;
  recurring?: boolean;
  onClick?: () => void;
}
```

**Transaction Card Features**
- Category icon with color coding
- Amount with color based on transaction type
- Recurring indicator
- Pending status indicator
- Expandable for more details

#### 2.3.4 Stats Card
```typescript
interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: number;
  trendPeriod?: string;
  icon?: React.ReactNode;
  formatter?: (value: number | string) => string;
  onClick?: () => void;
}
```

**Stats Card Features**
- Prominent value display
- Icon with background
- Trend indicator
- Click action for drill-down
- Value formatter for different data types

### 2.4 Chart Components

#### 2.4.1 Line Chart
```typescript
interface LineChartProps {
  data: Array<{
    date: Date | string;
    value: number;
    [key: string]: any;
  }>;
  height?: number | string;
  width?: number | string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  tooltipFormatter?: (value: number) => string;
  dateFormatter?: (date: Date | string) => string;
  color?: string;
  showArea?: boolean;
  showGrid?: boolean;
  showPoints?: boolean;
  curveType?: 'linear' | 'natural' | 'step' | 'monotone';
  isAnimated?: boolean;
  isInteractive?: boolean;
}
```

**Line Chart Features**
- Apple-inspired minimal design
- Smooth animations on data changes
- Interactive tooltips
- Responsive resizing
- Optional area fill below line
- Customizable curve type
- Optional point markers
- Grid lines with minimal styling

#### 2.4.2 Bar Chart
```typescript
interface BarChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
    [key: string]: any;
  }>;
  height?: number | string;
  width?: number | string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  tooltipFormatter?: (value: number) => string;
  showGrid?: boolean;
  layout?: 'vertical' | 'horizontal';
  isAnimated?: boolean;
  isInteractive?: boolean;
  maxValeu?: number;
}
```

**Bar Chart Features**
- Rounded bar corners
- Animation on load and data change
- Interactive bar hover state
- Optional grid lines
- Vertical or horizontal layout
- Color customization

#### 2.4.3 Pie/Donut Chart
```typescript
interface PieChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
    [key: string]: any;
  }>;
  height?: number | string;
  width?: number | string;
  innerRadius?: number; // 0 for pie, >0 for donut
  tooltipFormatter?: (value: number, total: number) => string;
  isAnimated?: boolean;
  isInteractive?: boolean;
  padAngle?: number;
  cornerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  legendPosition?: 'top' | 'right' | 'bottom' | 'left' | 'none';
}
```

**Pie/Donut Chart Features**
- Smooth sector transitions
- Interactive sector hover with scaling
- Detailed tooltips
- Optional legend
- Center content for donut chart
- Animation on load and data change

#### 2.4.4 Portfolio Allocation Chart
```typescript
interface PortfolioAllocationChartProps {
  data: Array<{
    assetClass: string;
    allocation: number;
    color?: string;
    subClasses?: Array<{
      name: string;
      allocation: number;
      color?: string;
    }>;
  }>;
  height?: number | string;
  width?: number | string;
  isAnimated?: boolean;
  isDrillable?: boolean;
  centerContent?: React.ReactNode;
  legendPosition?: 'top' | 'right' | 'bottom' | 'left' | 'none';
}
```

**Portfolio Allocation Features**
- Multi-level drilldown capability
- Parent-child relationships
- Center content to show total or selected segment
- Interactive segment selection
- Smooth transitions between views

### 2.5 Navigation Components

#### 2.5.1 Sidebar Navigation
```typescript
interface SidebarNavigationProps {
  items: Array<{
    label: string;
    icon?: React.ReactNode;
    path: string;
    children?: Array<{
      label: string;
      path: string;
    }>;
  }>;
  activeItem?: string;
  onNavigate?: (path: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  width?: string;
  collapsedWidth?: string;
  position?: 'fixed' | 'absolute' | 'relative';
}
```

**Sidebar Features**
- Collapsible and expandable
- Multi-level navigation
- Active item indication
- Icon and text display
- Smooth collapse/expand animation
- Mobile responsiveness
- Subtle hover effects

#### 2.5.2 Tab Navigation
```typescript
interface TabNavigationProps {
  tabs: Array<{
    label: string;
    id: string;
    icon?: React.ReactNode;
    count?: number;
    disabled?: boolean;
  }>;
  activeTab: string;
  onChange: (tabId: string) => void;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'line' | 'enclosed' | 'solid';
  isFitted?: boolean;
}
```

**Tab Features**
- Bottom border indicator
- Smooth indicator animation
- Optional icons
- Count badges
- Responsive behavior
- Disabled state

#### 2.5.3 Breadcrumbs
```typescript
interface BreadcrumbProps {
  items: Array<{
    label: string;
    path?: string;
    icon?: React.ReactNode;
  }>;
  separator?: React.ReactNode;
  maxItems?: number;
  onNavigate?: (path: string) => void;
}
```

**Breadcrumb Features**
- Custom separators
- Truncation for long paths
- Interactive items
- Current page indication
- Responsive collapsing

#### 2.5.4 Mobile Navigation
```typescript
interface MobileNavigationProps {
  items: Array<{
    label: string;
    icon: React.ReactNode;
    path: string;
    badge?: number;
  }>;
  activeItem?: string;
  onNavigate?: (path: string) => void;
}
```

**Mobile Navigation Features**
- Fixed bottom positioning
- Equal width items
- Icon and label display
- Active item indication
- Badge notifications
- Safe area padding for iOS

### 2.6 Data Display Components

#### 2.6.1 Data Table
```typescript
interface Column<T> {
  id: string;
  header: string | React.ReactNode;
  accessor: keyof T | ((row: T) => any);
  cell?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  pagination?: {
    pageSize: number;
    pageIndex: number;
    pageCount: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
  sorting?: {
    sortBy: { id: string; desc: boolean }[];
    onSortChange: (sortBy: { id: string; desc: boolean }[]) => void;
  };
  emptyState?: React.ReactNode;
  zebra?: boolean;
  compact?: boolean;
  showBorder?: boolean;
}
```

**Data Table Features**
- Sortable columns
- Resizable columns
- Pagination controls
- Loading state with skeleton
- Row hover state
- Row selection
- Empty state customization
- Mobile-responsive design

#### 2.6.2 Transaction List
```typescript
interface TransactionListProps {
  transactions: Array<{
    id: string;
    merchant: string;
    amount: number;
    date: Date;
    category: string;
    categoryIcon?: string;
    pending?: boolean;
    recurring?: boolean;
    [key: string]: any;
  }>;
  isLoading?: boolean;
  onTransactionClick?: (id: string) => void;
  groupByDate?: boolean;
  showCategories?: boolean;
  emptyState?: React.ReactNode;
  loadMore?: () => void;
  hasMore?: boolean;
}
```

**Transaction List Features**
- Date grouping with sticky headers
- Swipeable actions on mobile
- Category color indicators
- Pending transaction styling
- Recurring transaction indicators
- Infinite scrolling
- Pull-to-refresh on mobile
- Skeleton loading state

#### 2.6.3 Financial Health Score
```typescript
interface FinancialHealthScoreProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  components?: Array<{
    name: string;
    score: number;
    maxScore: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
  }>;
  recommendations?: string[];
  onDetailsClick?: () => void;
}
```

**Financial Health Score Features**
- Circular progress indicator
- Color-coded score ranges
- Score animation on load
- Component breakdown
- Status indicators
- Quick recommendations
- Detailed view expansion

#### 2.6.4 Budget Progress
```typescript
interface BudgetProgressProps {
  spent: number;
  budgeted: number;
  category?: string;
  categoryIcon?: React.ReactNode;
  period?: string;
  showRemaining?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'line' | 'circle' | 'semi-circle';
}
```

**Budget Progress Features**
- Progress bar with gradient coloring based on percentage
- Status color changes (green → yellow → red)
- Animated progress on load
- Remaining amount calculation
- Period display (This month, This week, etc.)
- Detailed breakdown on click/hover

## 3. Page-Specific Components and Features

### 3.1 Dashboard Page

#### 3.1.1 Dashboard Layout
- Responsive grid system with 12 columns
- Card-based layout with consistent spacing
- Customizable widget arrangement
- Clear section organization:
  - Financial overview
  - Spending insights
  - Investment performance
  - Financial goals
  - Recent transactions

#### 3.1.2 Account Summary Widget
```typescript
interface AccountSummaryProps {
  accounts: Array<{
    id: string;
    name: string;
    type: string;
    balance: number;
    institution?: string;
    institutionLogo?: string;
  }>;
  totalBalance: number;
  isLoading?: boolean;
  onAccountClick?: (id: string) => void;
  showAddAccount?: boolean;
  onAddAccount?: () => void;
}
```

**Account Summary Features**
- Total balance display with large typography
- Account cards in horizontal scrollable list
- Institution logo display
- Quick access to account details
- Add account button
- Loading state with skeleton

#### 3.1.3 Cash Flow Prediction Widget
```typescript
interface CashFlowPredictionProps {
  predictions: Array<{
    date: Date;
    cashFlow: number;
    confidenceLow?: number;
    confidenceHigh?: number;
  }>;
  periodBalance: number;
  periodText: string;
  alerts?: Array<{
    date: string;
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  isLoading?: boolean;
  onViewDetails?: () => void;
}
```

**Cash Flow Prediction Features**
- Line chart with confidence interval area
- Period balance summary
- Alert indicators for potential issues
- Day/week/month toggle
- Drill-down capability
- Visual indicators for income and expense days

#### 3.1.4 Financial Health Score Widget
```typescript
interface DashboardHealthScoreProps {
  score: number;
  previousScore?: number;
  change?: number;
  components: Array<{
    name: string;
    score: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
  }>;
  topRecommendation?: string;
  isLoading?: boolean;
  onViewDetails?: () => void;
}
```

**Health Score Widget Features**
- Score display with circular gauge
- Score change indicator
- Component breakdown preview
- Key recommendation
- View details button

#### 3.1.5 Recent Transactions Widget
```typescript
interface RecentTransactionsWidgetProps {
  transactions: Array<Transaction>;
  isLoading?: boolean;
  limit?: number;
  onViewAll?: () => void;
  onTransactionClick?: (id: string) => void;
}
```

**Recent Transactions Features**
- Compact transaction list
- Limited to recent items
- View all link
- Category indicators
- Pull to refresh on mobile

#### 3.1.6 Budget Overview Widget
```typescript
interface BudgetOverviewWidgetProps {
  budgets: Array<{
    category: string;
    spent: number;
    budgeted: number;
    categoryIcon?: React.ReactNode;
  }>;
  totalSpent: number;
  totalBudgeted: number;
  period: string;
  isLoading?: boolean;
  onViewDetails?: () => void;
}
```

**Budget Overview Features**
- Total budget vs. spent summary
- Individual category progress bars
- Color-coded status indicators
- Remaining amount calculations
- Days remaining in period

### 3.2 Cash Flow Prediction Page

#### 3.2.1 Prediction Chart
```typescript
interface PredictionChartProps {
  dailyPredictions: Array<{
    date: string;
    cashFlow: number;
    confidenceLow: number;
    confidenceHigh: number;
    recurringTransactions?: any[];
  }>;
  weeklyPredictions: Array<{
    startDate: string;
    endDate: string;
    cashFlow: number;
    confidenceLow: number;
    confidenceHigh: number;
  }>;
  monthlyPredictions: Array<{
    month: string;
    cashFlow: number;
    confidenceLow: number;
    confidenceHigh: number;
  }>;
  timeframe: 'daily' | 'weekly' | 'monthly';
  onTimeframeChange: (timeframe: 'daily' | 'weekly' | 'monthly') => void;
  showConfidenceInterval?: boolean;
  isLoading?: boolean;
}
```

**Prediction Chart Features**
- Smooth line chart with confidence interval area
- Time period toggling
- Interactive tooltips showing detailed information
- Day markers for significant cash events
- Color-coded positive/negative flows
- Animation on data or view changes

#### 3.2.2 Cash Flow Alerts
```typescript
interface CashFlowAlertsProps {
  alerts: Array<{
    date: string;
    type: 'negative-balance' | 'large-expense' | 'unusual-activity';
    message: string;
    severity: 'low' | 'medium' | 'high';
    relatedTransactions?: any[];
  }>;
  isLoading?: boolean;
  onAlertClick?: (alert: any) => void;
}
```

**Cash Flow Alerts Features**
- Severity-based color coding
- Expandable detail view
- Related transaction list
- Date-based organization
- Icon indicators for alert types

#### 3.2.3 Scenario Builder
```typescript
interface ScenarioBuilderProps {
  basePredictions: any;
  onCreateScenario: (scenario: any) => void;
  onCompareScenarios: (scenarioIds: string[]) => void;
  savedScenarios: Array<any>;
  onDeleteScenario: (id: string) => void;
}
```

**Scenario Builder Features**
- Ability to add/remove transactions
- Date and amount selection
- Recurring option toggle
- Comparison view with base prediction
- Save and name scenarios
- Compare multiple scenarios

### 3.3 Investment Portfolio Page

#### 3.3.1 Portfolio Overview
```typescript
interface PortfolioOverviewProps {
  totalValue: number;
  cashValue: number;
  investedValue: number;
  totalGain: number;
  totalGainPercentage: number;
  periodReturn: number;
  periodReturnPercentage: number;
  periodLabel: string;
  assetAllocation: Array<{
    assetClass: string;
    value: number;
    percentage: number;
  }>;
  isLoading?: boolean;
}
```

**Portfolio Overview Features**
- Total value with large typography
- Gain/loss indicators with colors
- Asset allocation donut chart
- Performance metrics
- Time period selector
- Cash percentage indicator

#### 3.3.2 Holdings Table
```typescript
interface HoldingsTableProps {
  holdings: Array<{
    id: string;
    name: string;
    ticker?: string;
    quantity: number;
    price: number;
    value: number;
    costBasis?: number;
    gain?: number;
    gainPercentage?: number;
    assetClass: string;
  }>;
  sorting: {
    sortBy: { id: string; desc: boolean };
    onSortChange: (sortBy: { id: string; desc: boolean }) => void;
  };
  isLoading?: boolean;
  onHoldingClick?: (id: string) => void;
}
```

**Holdings Table Features**
- Sortable columns
- Gain/loss color coding
- Search and filter capabilities
- Asset class grouping option
- Performance indicators
- Responsive design for mobile

#### 3.3.3 Performance Chart
```typescript
interface PerformanceChartProps {
  performanceData: Array<{
    date: Date;
    value: number;
  }>;
  benchmarks?: Array<{
    name: string;
    data: Array<{
      date: Date;
      value: number;
    }>;
    color: string;
  }>;
  timeRange: '1D' | '1W' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '3Y' | '5Y' | 'ALL';
  onTimeRangeChange: (range: string) => void;
  isLoading?: boolean;
}
```

**Performance Chart Features**
- Interactive line chart
- Time range selector
- Benchmark comparison
- Percentage and absolute value toggle
- Point-in-time details on hover
- Annotation for significant events

#### 3.3.4 Tax Optimization
```typescript
interface TaxOptimizationProps {
  harvestOpportunities: Array<{
    securityId: string;
    ticker?: string;
    name: string;
    totalLoss: number;
    taxSavingsEstimate: number;
    suggestedAlternatives?: Array<{
      securityId: string;
      ticker?: string;
      name: string;
      correlation: number;
    }>;
  }>;
  estimatedTaxSavings: number;
  isLoading?: boolean;
  onViewOpportunity?: (id: string) => void;
}
```

**Tax Optimization Features**
- Loss harvesting opportunities
- Estimated tax savings
- Recommended alternative investments
- Sorting by potential savings
- Detailed view with pros/cons

### 3.4 Financial Health Score Page

#### 3.4.1 Health Score Overview
```typescript
interface HealthScoreOverviewProps {
  overallScore: number;
  statusSummary: 'excellent' | 'good' | 'fair' | 'poor';
  components: {
    emergencySavings: { score: number; status: string };
    debt: { score: number; status: string };
    retirement: { score: number; status: string };
    spending: { score: number; status: string };
    insurance: { score: number; status: string };
    credit: { score: number; status: string };
  };
  topRecommendations: string[];
  isLoading?: boolean;
}
```

**Health Score Overview Features**
- Large circular score display
- Status text with color coding
- Component breakdown cards
- Top recommendations list
- Historical trend line

#### 3.4.2 Score Component Detail
```typescript
interface ScoreComponentDetailProps {
  component: string;
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  details: any;
  recommendations: string[];
  isLoading?: boolean;
}
```

**Component Detail Features**
- Detailed breakdown of score factors
- Specific recommendations
- Visual indicators of problem areas
- Interactive elements for improvement actions
- Educational content links

#### 3.4.3 Score History Chart
```typescript
interface ScoreHistoryChartProps {
  history: Array<{
    date: string;
    score: number;
  }>;
  isLoading?: boolean;
  onPointClick?: (point: { date: string; score: number }) => void;
}
```

**Score History Features**
- Line chart showing score over time
- Milestone markers for significant changes
- Hover tooltips with detailed information
- Annotation for important events
- Responsive design for all devices

## 4. Animation and Interaction Design

### 4.1 Motion Principles

#### 4.1.1 Core Animation Values
```typescript
// Animation timing functions
export const animationTimingFunctions = {
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
};

// Animation durations
export const animationDurations = {
  xs: '100ms',
  sm: '150ms',
  md: '200ms',
  lg: '300ms',
  xl: '500ms',
};
```

#### 4.1.2 Motion Guidelines
- **Purpose**: Animations should enhance understanding, not distract
- **Consistency**: Similar actions should have similar animations
- **Subtlety**: Financial data interfaces should use restraint in animation
- **Performance**: Optimize for 60fps, avoid janky animations
- **Meaningful**: Transitions should help users understand state changes
- **Responsive**: Adjust animations based on device capabilities and user preferences

### 4.2 Component-Level Animations

#### 4.2.1 Button Animation
- Subtle scale on hover (1.02)
- Scale down on active/press (0.98)
- Ripple effect emanating from click point
- Smooth color/shadow transitions

#### 4.2.2 Input Focus Animation
- Border color transition
- Subtle highlight or glow effect
- Label movement (floating label pattern)
- Error state transition

#### 4.2.3 Card Interaction
- Subtle elevation increase on hover
- Smooth shadow transition
- Subtle scale effect for interactive cards
- Content fade-in on load

#### 4.2.4 Chart Animations
- Progressive data point reveal
- Smooth line drawing animation
- Bar/column growing animation
- Pie/donut segment reveal
- Smooth transitions between data sets

### 4.3 Page-Level Transitions

#### 4.3.1 Page Transition System
```typescript
interface TransitionProps {
  children: React.ReactNode;
  type: 'fade' | 'slide-up' | 'slide-right' | 'slide-down' | 'slide-left' | 'scale';
  duration?: number;
  delay?: number;
  easing?: string;
  isAnimated?: boolean;
}
```

#### 4.3.2 Transition Types
- **Fade**: Simple opacity transition
- **Slide**: Direction-based sliding with fade
- **Scale**: Grow/shrink with fade
- **Custom**: Complex transitions for special cases

#### 4.3.3 Transition Coordination
- Coordinated transitions between related elements
- Staggered animations for lists and groups
- Context-aware transitions based on navigation direction

### 4.4 Data Visualization Animations

#### 4.4.1 Chart Entry Animations
- Progressive line drawing for line charts
- Growing bars for bar charts
- Expanding segments for pie/donut charts
- Fading in for scatter plots
- Sequence-based animations for complex visualizations

#### 4.4.2 Data Update Animations
- Smooth transitions between data sets
- Axis rescaling animation
- Value change animations for numbers
- Color transitions for status changes

#### 4.4.3 Interactive Feedback
- Hover state highlights
- Selection indicators
- Focus states
- Active state feedback

### 4.5 Micro-Interactions

#### 4.5.1 Currency Value Changes
- Value ticker animation for changing numbers
- Color flash for significant changes
- Directional indicators (up/down arrows)
- Counter animation for totals

#### 4.5.2 Status Changes
- Progress transitions
- Status icon animations
- Alert appearance/disappearance
- State change indicators

#### 4.5.3 Success/Error Feedback
- Check mark animation for success
- Shake animation for errors
- Progress indicators for loading
- Celebratory animations for achievements

## 5. Responsive Design Strategy

### 5.1 Responsive Framework

#### 5.1.1 Breakpoint System
```css
/* Breakpoint tokens */
:root {
  --breakpoint-xs: 20rem;   /* 320px - Small mobile */
  --breakpoint-sm: 30rem;   /* 480px - Mobile */
  --breakpoint-md: 48rem;   /* 768px - Tablet */
  --breakpoint-lg: 64rem;   /* 1024px - Desktop */
  --breakpoint-xl: 80rem;   /* 1280px - Large desktop */
  --breakpoint-2xl: 96rem;  /* 1536px - Extra large desktop */
}
```

#### 5.1.2 CSS Media Query Mixins
```scss
// SCSS media query mixins
@mixin xs {
  @media (min-width: 20rem) { @content; }
}

@mixin sm {
  @media (min-width: 30rem) { @content; }
}

@mixin md {
  @media (min-width: 48rem) { @content; }
}

@mixin lg {
  @media (min-width: 64rem) { @content; }
}

@mixin xl {
  @media (min-width: 80rem) { @content; }
}

@mixin xxl {
  @media (min-width: 96rem) { @content; }
}

// For React styled-components
const breakpoints = {
  xs: '20rem',
  sm: '30rem',
  md: '48rem',
  lg: '64rem',
  xl: '80rem',
  xxl: '96rem',
};

export const media = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  xxl: `@media (min-width: ${breakpoints.xxl})`,
};
```

#### 5.1.3 Responsive Component Props
```typescript
// Responsive prop types
type ResponsiveValue<T> = T | { xs?: T; sm?: T; md?: T; lg?: T; xl?: T; xxl?: T };

// Example responsive component
interface BoxProps {
  width?: ResponsiveValue<string | number>;
  height?: ResponsiveValue<string | number>;
  padding?: ResponsiveValue<string | number>;
  margin?: ResponsiveValue<string | number>;
  display?: ResponsiveValue<'block' | 'flex' | 'grid' | 'inline' | 'inline-block' | 'none'>;
  // Other props...
}
```

### 5.2 Mobile-First Approach

#### 5.2.1 Touch-Optimized Elements
- Minimum touch target size of 44×44px
- Adequate spacing between interactive elements
- Touch feedback states
- Gesture support (swipe, pinch, etc.)
- Thumb-friendly zone placement for key actions

#### 5.2.2 Mobile Layout Patterns
- Single column layouts for xs and sm breakpoints
- Stacked card patterns
- Collapsible sections
- Bottom sheet dialogs
- Full-screen modals
- Fixed navigation at bottom
- Pull-to-refresh patterns

#### 5.2.3 Content Prioritization
- Essential content first approach
- Progressive disclosure of complex features
- "Above the fold" critical information
- Collapsible secondary information
- Right-sized visualizations

### 5.3 Tablet Adaptations

#### 5.3.1 Layout Changes
- Two-column layouts where appropriate
- Master-detail pattern
- Sidebar navigation (collapsible)
- Grid-based content organization
- Split view for complex tools

#### 5.3.2 Interaction Refinements
- Hover states introduced
- Tooltip access
- Expanded navigation options
- More visible secondary actions
- Enhanced keyboard support

### 5.4 Desktop Optimizations

#### 5.4.1 Multi-Column Layouts
- Full dashboard with multiple columns
- Advanced grid systems
- Side-by-side comparison views
- Full sidebar navigation
- Persistent secondary panels

#### 5.4.2 Advanced Interactions
- Keyboard shortcuts
- Context menus
- Enhanced tooltips
- Drag and drop functionality
- Multiple panel workflows
- Advanced filtering and customization controls

### 5.5 Responsive Component Examples

#### 5.5.1 Responsive Card Grid
```typescript
interface CardGridProps {
  children: React.ReactNode;
  columns?: ResponsiveValue<number>;
  spacing?: ResponsiveValue<string | number>;
  width?: ResponsiveValue<string>;
}
```

**CSS Implementation**
```css
.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-md);
}

@media (min-width: 48rem) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 64rem) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 80rem) {
  .card-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

#### 5.5.2 Responsive Navigation
- Mobile: Bottom tab bar with hamburger menu
- Tablet: Collapsible sidebar
- Desktop: Full sidebar with expandable sections

#### 5.5.3 Responsive Charts
- Mobile: Simplified visualizations, focused on key data
- Tablet: Enhanced detail, more data points
- Desktop: Full feature set with additional controls

## 6. Advanced UI Features

### 6.1 Theme System Implementation

#### 6.1.1 Theme Provider
```typescript
interface ThemeContextType {
  currentTheme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  isDarkMode: boolean;
}

const ThemeContext = React.createContext<ThemeContextType>({
  currentTheme: 'system',
  setTheme: () => {},
  isDarkMode: false,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Implementation details...
  
  return (
    <ThemeContext.Provider value={themeContextValue}>
      <div className={isDarkMode ? 'theme-dark' : 'theme-light'}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
```

#### 6.1.2 Theme Switching
- Smooth transition animation between themes (150-300ms)
- System preference detection and matching
- User preference persistence in localStorage
- Time-based automatic switching option

### 6.2 Dashboard Customization

#### 6.2.1 Widget System
```typescript
interface WidgetConfig {
  id: string;
  type: string;
  title?: string;
  size: 'small' | 'medium' | 'large';
  position: number;
  settings?: Record<string, any>;
  isVisible: boolean;
}

interface DashboardConfig {
  layout: WidgetConfig[];
  version: number;
}

interface DashboardContextType {
  config: DashboardConfig;
  updateWidgetPosition: (id: string, newPosition: number) => void;
  updateWidgetVisibility: (id: string, isVisible: boolean) => void;
  updateWidgetSize: (id: string, size: 'small' | 'medium' | 'large') => void;
  updateWidgetSettings: (id: string, settings: Record<string, any>) => void;
  resetToDefault: () => void;
}
```

#### 6.2.2 Drag and Drop Interface
- Smooth drag animations
- Visual feedback during drag
- Responsive grid rearrangement
- Size adjustment handles
- Settings access via widget headers
- Visibility toggles

### 6.3 Onboarding and Empty States

#### 6.3.1 Onboarding System
```typescript
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  element?: string; // CSS selector for focused element
  position?: 'top' | 'right' | 'bottom' | 'left';
  action?: () => void;
  isCompleted?: boolean;
}

interface OnboardingTourProps {
  steps: OnboardingStep[];
  isActive: boolean;
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  onComplete: () => void;
}
```

**Onboarding Features**
- Step-by-step guided tour
- Element highlighting
- Focus management
- Progress indicator
- Skip option
- Completion celebration

#### 6.3.2 Empty State System
```typescript
interface EmptyStateProps {
  type: 'account' | 'transaction' | 'budget' | 'investment' | 'generic';
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  illustration?: React.ReactNode;
}
```

**Empty State Features**
- Contextual illustrations
- Clear explanatory text
- Primary action button
- Secondary action link
- Animation on appearance

### 6.4 Notification System

#### 6.4.1 Toast Notifications
```typescript
interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  icon?: React.ReactNode;
  duration?: number;
  isClosable?: boolean;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  showToast: (toast: Omit<ToastProps, 'id'>) => string;
  updateToast: (id: string, toast: Partial<ToastProps>) => void;
  closeToast: (id: string) => void;
  closeAll: () => void;
}
```

**Toast Features**
- Slide-in animation
- Auto-dismissal with timer
- Manual close option
- Status icons
- Action buttons
- Stacking behavior for multiple toasts

#### 6.4.2 In-App Notification Center
```typescript
interface Notification {
  id: string;
  type: 'alert' | 'update' | 'suggestion' | 'achievement';
  title: string;
  description: string;
  date: Date;
  isRead: boolean;
  link?: string;
  icon?: string;
}

interface NotificationCenterProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick: (notification: Notification) => void;
  onClearAll: () => void;
  isLoading?: boolean;
}
```

**Notification Center Features**
- Badge indicator for unread count
- Dropdown or slide-in panel
- Categorized notifications
- Read/unread status
- Time/date display
- Mark as read functionality
- Clear all option

### 6.5 Goal Setting and Tracking

#### 6.5.1 Goal Creation Flow
```typescript
interface GoalCreationProps {
  onCreateGoal: (goal: any) => void;
  presetGoals?: Array<{
    type: string;
    name: string;
    icon: string;
    suggestedAmount?: number;
    suggestedTimeframe?: string;
  }>;
  maxGoals?: number;
  currentGoalsCount: number;
}
```

**Goal Creation Features**
- Multi-step creation wizard
- Preset goal templates
- Custom goal option
- Amount and timeframe inputs
- Contribution calculation
- Visual preview
- Completion celebration

#### 6.5.2 Goal Tracking
```typescript
interface GoalTrackingProps {
  goal: {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: Date;
    startDate: Date;
    category: string;
    icon?: string;
    color?: string;
  };
  contributions: Array<{
    date: Date;
    amount: number;
  }>;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddContribution: (amount: number) => void;
}
```

**Goal Tracking Features**
- Progress visualization
- Timeline display
- Milestone markers
- Contribution history
- Projected completion calculations
- Adjustment controls

## 7. Implementation and Performance Optimization

### 7.1 Component Architecture

#### 7.1.1 Component Structure
```typescript
// Atomic design approach
// Atoms (basic building blocks)
// Examples: Button, Input, Text, Icon

// Molecules (simple combinations of atoms)
// Examples: InputGroup, Card, Alert, FormField

// Organisms (complex UI components)
// Examples: TransactionList, BudgetSummary, AccountCard

// Templates (page layouts without specific content)
// Examples: DashboardLayout, SettingsLayout

// Pages (complete views with specific content)
// Examples: DashboardPage, InvestmentsPage, BudgetPage
```

#### 7.1.2 Component Composition Pattern
```typescript
// Example of composition pattern
const Card = ({ children, ...props }) => {
  return <div className="card" {...props}>{children}</div>;
};

Card.Header = ({ children, ...props }) => {
  return <div className="card-header" {...props}>{children}</div>;
};

Card.Body = ({ children, ...props }) => {
  return <div className="card-body" {...props}>{children}</div>;
};

Card.Footer = ({ children, ...props }) => {
  return <div className="card-footer" {...props}>{children}</div>;
};

// Usage
<Card>
  <Card.Header>
    <h3>Account Summary</h3>
  </Card.Header>
  <Card.Body>
    <p>Content goes here</p>
  </Card.Body>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

### 7.2 Performance Optimization

#### 7.2.1 Code-Splitting
```typescript
// React.lazy for component code-splitting
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Investments = React.lazy(() => import('./pages/Investments'));
const CashFlow = React.lazy(() => import('./pages/CashFlow'));

// With suspense
<Suspense fallback={<LoadingSpinner />}>
  <Switch>
    <Route path="/dashboard" component={Dashboard} />
    <Route path="/investments" component={Investments} />
    <Route path="/cash-flow" component={CashFlow/>
  </Switch>
</Suspense>
```

#### 7.2.2 Virtualization for Large Lists
```typescript
// Using react-window for virtualized lists
import { FixedSizeList } from 'react-window';

const VirtualizedTransactionList = ({ transactions, rowHeight = 72, maxHeight = 600 }) => {
  return (
    <FixedSizeList
      height={Math.min(transactions.length * rowHeight, maxHeight)}
      width="100%"
      itemCount={transactions.length}
      itemSize={rowHeight}
    >
      {({ index, style }) => (
        <div style={style}>
          <TransactionItem transaction={transactions[index]} />
        </div>
      )}
    </FixedSizeList>
  );
};
```

#### 7.2.3 Optimized Rendering
```typescript
// Memoization for expensive components
const MemoizedChart = React.memo(({ data, options }) => {
  // Chart rendering logic
  return <div className="chart">{/* Chart rendering */}</div>;
}, (prevProps, nextProps) => {
  // Custom comparison for complex data structures
  return isEqual(prevProps.data, nextProps.data) && 
         isEqual(prevProps.options, nextProps.options);
});

// Using useCallback for event handlers
const handleFilterChange = useCallback((filters) => {
  setActiveFilters(filters);
  fetchFilteredData(filters);
}, [fetchFilteredData]);
```

#### 7.2.4 Progressive Loading
```typescript
// Progressive dashboard loading
const DashboardPage = () => {
  return (
    <div className="dashboard">
      {/* Critical sections load first */}
      <AccountSummary priority="high" />
      
      {/* Secondary content with deferred loading */}
      <Suspense fallback={<SkeletonLoader type="transactions" />}>
        <RecentTransactions />
      </Suspense>
      
      {/* Low priority content loaded last */}
      <Suspense fallback={<SkeletonLoader type="insights" />}>
        <FinancialInsights />
      </Suspense>
    </div>
  );
};
```

### 7.3 Skeleton Screens and Loading States

#### 7.3.1 Component-Specific Skeletons
```typescript
// Dashboard skeleton screens
const DashboardSkeleton = () => {
  return (
    <div className="dashboard-skeleton">
      <div className="account-summary-skeleton">
        <div className="header-skeleton"></div>
        <div className="balance-skeleton"></div>
        <div className="account-cards-skeleton">
          {[1, 2, 3].map(i => (
            <div key={i} className="account-card-skeleton"></div>
          ))}
        </div>
      </div>
      
      <div className="chart-skeleton">
        <div className="header-skeleton"></div>
        <div className="chart-body-skeleton"></div>
      </div>
      
      <div className="transactions-skeleton">
        <div className="header-skeleton"></div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="transaction-item-skeleton"></div>
        ))}
      </div>
    </div>
  );
};
```

#### 7.3.2 Skeleton Animation
```css
@keyframes shimmer {
  0% {
    background-position: -500px 0;
  }
  100% {
    background-position: 500px 0;
  }
}

.skeleton-element {
  background: linear-gradient(90deg, 
    var(--color-skeleton-base) 0%, 
    var(--color-skeleton-highlight) 50%, 
    var(--color-skeleton-base) 100%);
  background-size: 1000px 100%;
  animation: shimmer 1.5s infinite linear;
}
```

#### 7.3.3 Progressive Data Loading
```typescript
// Progressive chart data loading
const PerformanceChart = ({ timeRange }) => {
  const [data, setData] = useState(null);
  const [resolution, setResolution] = useState('low');
  
  useEffect(() => {
    // First load low resolution data quickly
    fetchPerformanceData(timeRange, 'low').then(lowResData => {
      setData(lowResData);
      setResolution('low');
      
      // Then load high resolution data
      fetchPerformanceData(timeRange, 'high').then(highResData => {
        setData(highResData);
        setResolution('high');
      });
    });
  }, [timeRange]);
  
  return (
    <div className="performance-chart">
      {!data ? (
        <ChartSkeleton />
      ) : (
        <LineChart 
          data={data} 
          showDataPoints={resolution === 'high'} 
        />
      )}
    </div>
  );
};
```

## 8. Mobile-Specific Enhancements

### 8.1 Touch and Gesture Support

#### 8.1.1 Swipe Actions
```typescript
interface SwipeableItemProps {
  children: React.ReactNode;
  leftActions?: Array<{
    icon: React.ReactNode;
    label: string;
    color: string;
    onAction: () => void;
  }>;
  rightActions?: Array<{
    icon: React.ReactNode;
    label: string;
    color: string;
    onAction: () => void;
  }>;
  threshold?: number;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}
```

**Swipeable Transaction Item**
- Left swipe: Categorize, Split, Add note
- Right swipe: Delete, Hide, Flag
- Visual feedback during swipe
- Action activation on threshold
- Spring animation on release

#### 8.1.2 Pull-to-Refresh
```typescript
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  pullThreshold?: number;
  maxPullDistance?: number;
  children: React.ReactNode;
  refreshingComponent?: React.ReactNode;
}
```

**Pull-to-Refresh Features**
- Visual pull indicator
- Elastic pull effect
- Custom refresh animation
- Haptic feedback on activation
- Success indicator on completion

#### 8.1.3 Pinch-to-Zoom
```typescript
interface ZoomableChartProps {
  data: any[];
  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
  onZoomChange?: (zoom: number) => void;
  children: React.ReactNode;
}
```

**Zoomable Chart Features**
- Smooth pinch zoom for charts
- Double-tap to reset zoom
- Two-finger pan for navigation
- Scale indicators
- Detail enhancement at higher zoom levels

### 8.2 Bottom Sheet Dialogs

```typescript
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  snapPoints?: Array<string | number>;
  initialSnapPoint?: number;
  header?: React.ReactNode;
  children: React.ReactNode;
  height?: string | number;
  maxHeight?: string | number;
  closeOnBackdropClick?: boolean;
  enableDrag?: boolean;
  onSnapPointChange?: (index: number) => void;
}
```

**Bottom Sheet Features**
- Smooth animation from bottom
- Multiple snap points (half, full)
- Draggable handle
- Momentum scrolling
- Backdrop interaction
- Safe area padding for iOS
- Keyboard avoidance

### 8.3 Mobile Navigation

#### 8.3.1 Tab Bar Navigation
```typescript
interface TabBarProps {
  items: Array<{
    label: string;
    icon: React.ReactNode;
    activeIcon?: React.ReactNode;
    path: string;
    badge?: number;
  }>;
  activeItem: string;
  onNavigate: (path: string) => void;
}
```

**Tab Bar Features**
- Fixed at bottom of screen
- Equal width items
- Icon and label for each item
- Active state indicator
- Badge support for notifications
- Subtle animation on tab change
- Safe area inset on iOS

#### 8.3.2 Drawer Navigation
```typescript
interface DrawerNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  header?: React.ReactNode;
  items: Array<{
    label: string;
    icon?: React.ReactNode;
    path: string;
    children?: Array<{
      label: string;
      path: string;
    }>;
  }>;
  footer?: React.ReactNode;
  activeItem?: string;
  onNavigate: (path: string) => void;
}
```

**Drawer Features**
- Side drawer animation
- Backdrop with opacity
- Touch gesture to open/close
- Nested navigation groups
- Active item indication
- Profile section in header
- Quick actions in footer

### 8.4 Mobile Form Optimization

#### 8.4.1 Mobile Form Fields
- Larger touch targets (min 44×44px)
- Full-width inputs
- Label positioning above inputs
- Clear touch feedback states
- Native input types (tel, email, etc.)

#### 8.4.2 Form Steppers
```typescript
interface FormStepperProps {
  steps: Array<{
    id: string;
    title: string;
    component: React.ReactNode;
    validation?: () => boolean | Promise<boolean>;
  }>;
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onComplete: () => void;
  isSubmitting?: boolean;
}
```

**Form Stepper Features**
- Single screen per step
- Progress indicator
- Step navigation
- Validation before progression
- Back button handling
- Form state preservation

## 9. Implementation Timeline

### Phase 1: Design System Foundation (Weeks 1-3)
- Establish design tokens and variables
- Implement color system
- Create typography framework
- Build core component library (buttons, inputs, cards)
- Implement theming system
- Create responsive layout framework

### Phase 2: Dashboard Enhancement (Weeks 4-6)
- Redesign account summary section
- Implement new chart components
- Create financial health score widget
- Build transaction list component
- Enhance mobile responsiveness
- Add animations and transitions

### Phase 3: Feature-Specific Enhancements (Weeks 7-10)
- Cash Flow Prediction page enhancements
- Investment Portfolio visualization improvements
- Financial Health Score detailed view
- Budget management interface
- Goal tracking implementation
- Settings and preferences pages

### Phase 4: Advanced Features (Weeks 11-13)
- Dashboard customization system
- Implement notification system
- Add onboarding flows
- Create empty states
- Implement advanced interactions
- Mobile gesture support

### Phase 5: Performance and Polish (Weeks 14-16)
- Performance optimization
- Accessibility improvements
- Cross-browser testing
- Animation refinement
- Documentation completion
- Final design review and adjustments

## 10. Conclusion

This comprehensive UI enhancement plan for the Finance Intelligence Suite will transform the application into a modern, intuitive, and visually appealing platform. By implementing a consistent design system based on principles from Apple, SoFi, Clarity.AI, and Robinhood, the interface will establish a professional and trustworthy presence in the financial technology space.

The plan addresses all aspects of the user interface:
- A robust design language with color, typography, and space
- A comprehensive component library tailored for financial data
- Responsive layouts that work seamlessly across devices
- Thoughtful animations that enhance understanding
- Performance optimizations for a smooth experience
- Mobile-specific enhancements for on-the-go users

When implemented, these improvements will significantly enhance user engagement, improve feature discovery, and create a cohesive experience that builds trust and confidence for users managing their financial lives.
