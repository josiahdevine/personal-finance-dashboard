// Centralized lowercase re-exports to solve case sensitivity issues
// This file acts as a bridge between case-sensitive environments

// Re-export core components
export { default as ErrorBoundary } from './ErrorBoundary';
export { LandingPage } from './LandingPage';
export { Login } from './Login';

// Re-export UI components 
// (ADD MORE AS NEEDED)

// Re-export feature components
// (ADD MORE AS NEEDED)

// Re-export layout components
// (ADD MORE AS NEEDED)

/**
 * HOW TO USE THIS FILE:
 * 
 * When you encounter a case sensitivity build error like:
 * "Module not found: Error: Can't resolve './components/SomeComponent'"
 * 
 * 1. Create a new file in lower-components/SomeComponent.js that re-exports the component
 * 2. Add the export to this index.js file 
 * 3. Update the import in the original file to use: 
 *    import { SomeComponent } from './lower-components'
 */ 