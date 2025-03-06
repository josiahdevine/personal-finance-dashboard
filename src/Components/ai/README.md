# AI Components

## AiAssistant

The `AiAssistant` component provides an interactive AI-powered chat interface for financial assistance. It allows users to ask questions about their finances and receive intelligent responses with follow-up suggestions.

### Features

- Real-time AI responses
- Suggested follow-up questions
- Loading states and error handling
- Animated UI elements using Framer Motion
- Fully responsive design
- TypeScript support
- Comprehensive test coverage

### Usage

```tsx
import { AiAssistant } from '../components/ai/AiAssistant';

function MyComponent() {
  return (
    <div>
      <AiAssistant />
    </div>
  );
}
```

### API Integration

The component expects a backend endpoint at `/api/ai/ask` that accepts POST requests with the following structure:

```typescript
// Request
{
  question: string;
}

// Response
{
  answer: string;
  suggestions: string[];
}
```

### Testing

The component includes comprehensive tests covering:
- Input validation
- Loading states
- Error handling
- Suggestion interaction
- API integration

Run tests using:
```bash
npm test src/components/ai/__tests__/AiAssistant.test.tsx
```

### Styling

The component uses Tailwind CSS for styling and includes:
- Responsive input field
- Animated error messages
- Loading states
- Interactive suggestion buttons
- Clean, modern UI design 