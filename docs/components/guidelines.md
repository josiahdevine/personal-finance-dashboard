# React Component Guidelines

## Component Structure

### Functional Components
Use functional components with hooks as the default approach:

```typescript
import React from 'react';
import { ComponentProps } from '../types';

export const MyComponent: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  return (
    <div>
      {/* Component content */}
    </div>
  );
};
```

### File Organization
```
components/
├── common/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   └── Card/
├── features/
│   ├── Dashboard/
│   └── Transactions/
└── layout/
    ├── Header/
    └── Sidebar/
```

## Styling Guidelines

### Tailwind CSS Usage
```typescript
// Preferred approach using Tailwind classes
const Button = ({ children }) => (
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    {children}
  </button>
);

// For complex styles, use @apply in a separate CSS file
// styles.css
.custom-button {
  @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600;
}
```

### Component Props

```typescript
// Props interface
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

// Usage
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  children,
}) => {
  // Component implementation
};
```

## State Management

### Local State
```typescript
const [isOpen, setIsOpen] = useState(false);
```

### Context API
```typescript
// Create context
export const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

// Provider component
export const ThemeProvider: React.FC = ({ children }) => {
  // Provider implementation
};

// Usage
const theme = useContext(ThemeContext);
```

## Performance Optimization

### Memoization
```typescript
// Memoize expensive calculations
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// Memoize callbacks
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b);
  },
  [a, b],
);
```

### Code Splitting
```typescript
const LazyComponent = React.lazy(() => import('./LazyComponent'));
```

## Testing

### Component Tests
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

## Accessibility

### ARIA Labels
```typescript
<button
  aria-label="Close menu"
  aria-expanded={isOpen}
  onClick={handleClose}
>
  <Icon name="close" />
</button>
```

## Error Handling

### Error Boundaries
```typescript
class ErrorBoundary extends React.Component {
  // Error boundary implementation
}
```

## Documentation

### Component Documentation
```typescript
/**
 * Button component that follows the design system
 * @param {ButtonProps} props - The component props
 * @returns {JSX.Element} The button component
 */
export const Button: React.FC<ButtonProps> = (props) => {
  // Implementation
};
```

## Best Practices

1. Keep components focused and single-responsibility
2. Use TypeScript for better type safety
3. Implement proper error handling
4. Write comprehensive tests
5. Follow accessibility guidelines
6. Document component APIs
7. Optimize performance where needed
8. Use consistent naming conventions
9. Implement proper prop validation
10. Follow the project's style guide

## Common Patterns

### Loading States
```typescript
const LoadingState = () => (
  <div className="animate-pulse">
    {/* Loading UI */}
  </div>
);
```

### Error States
```typescript
const ErrorState = ({ error, retry }) => (
  <div role="alert">
    {/* Error UI */}
  </div>
);
```

### Form Handling
```typescript
const Form = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

## Review Checklist

Before submitting a component for review, ensure:

- [ ] Component is typed with TypeScript
- [ ] Props are properly documented
- [ ] Tests are written and passing
- [ ] Accessibility features are implemented
- [ ] Performance optimizations are applied where needed
- [ ] Code follows style guide
- [ ] Documentation is complete
- [ ] Error states are handled
- [ ] Loading states are implemented
- [ ] Component is responsive 