// Simple test to verify imports
import ErrorBoundary from './ErrorBoundary';
import ErrorBoundaryComponent from './components/ErrorBoundary';

console.log('ErrorBoundary from root:', ErrorBoundary);
console.log('ErrorBoundary from components:', ErrorBoundaryComponent);

// If we get here without errors, the imports work correctly
console.log('Imports working correctly!'); 