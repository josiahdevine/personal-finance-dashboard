# Handling Case Sensitivity in Cross-Environment Development

This document provides guidance on managing case sensitivity issues between Windows and Linux/Unix environments, which is particularly important for our Netlify deployments.

## Background

Windows has a case-insensitive filesystem, while Linux/Unix (including Netlify's build environment) has a case-sensitive filesystem. This can lead to build failures when files are referenced with incorrect casing.

For example, if you have a component `MyComponent.tsx` and import it as:

```javascript
import { MyComponent } from './components/mycomponent';
```

This will work on Windows but fail on Linux/Unix because the cases don't match.

## Our Solution

We've implemented three key solutions to address this:

### 1. Component Bridge Pattern

We created a `lower-components` directory that contains bridge files that re-export components with consistent casing:

```
src/
├── lower-components/
│   ├── index.js          // Central export file
│   ├── ComponentName.js  // Individual bridge files
```

### 2. Helper Script

We've created a helper script to automate the creation of bridge files:

```bash
# Basic usage
node create-component-bridge.js ComponentName

# For components in subdirectories
node create-component-bridge.js Login auth
```

### 3. Git Configuration

A `.gitattributes` file has been added to normalize line endings and help with consistency:

```
* text=auto eol=lf
```

## Module Compatibility

This project uses ES modules for its JavaScript files, as specified by the `"type": "module"` in package.json. This means:

1. All `.js` files are treated as ES modules
2. Use `import` and `export` syntax instead of `require` and `module.exports`
3. Configuration files like `craco.config.js` must use ES module syntax
4. File extensions are more important in ES modules

### Configuration Files and Module Systems

Some tools like CRACO are built with CommonJS and expect to load configuration files using `require()`. When your project uses `"type": "module"`, this creates a conflict. We've implemented a dual-module approach:

1. **craco.config.cjs**: CommonJS version (using `require`/`module.exports`) that CRACO can load

The `.cjs` extension explicitly tells Node.js to treat the file as CommonJS, regardless of the `"type"` setting in package.json.

To make this work correctly:

1. Make sure you only have a CommonJS version of the config file (craco.config.cjs)
2. Set the `CRACO_CONFIG_PATH` environment variable to point to this file:
   ```
   CRACO_CONFIG_PATH=./craco.config.cjs
   ```
3. Update the npm scripts in package.json to include this environment variable:
   ```json
   "scripts": {
     "start": "cross-env CRACO_CONFIG_PATH=./craco.config.cjs craco start",
     "build": "cross-env CRACO_CONFIG_PATH=./craco.config.cjs craco build",
     "test": "cross-env CRACO_CONFIG_PATH=./craco.config.cjs craco test"
   }
   ```
4. Configure Netlify to use this environment variable in netlify.toml:
   ```toml
   [build.environment]
     CRACO_CONFIG_PATH = "./craco.config.cjs"
   ```

When updating configuration, make sure to update the CommonJS version of the file.

### File Extensions in ES Modules

When working with ES modules, be careful with imports that reference specific files (like browser polyfills):

```javascript
// Incorrect: Missing file extension
import process from 'process/browser';

// Correct: Include the file extension
import process from 'process/browser.js';
```

For packages with index files or package.json "exports" configurations, you can still import without extensions:

```javascript
// This works because "react" has a package.json that defines its exports
import React from 'react';
```

### Component Import Extensions

For our component bridge pattern, we need to include extensions when importing components:

```javascript
// In src/lower-components/index.js
// Incorrect:
export { LandingPage } from './LandingPage';

// Correct:
export { LandingPage } from './LandingPage.js';
```

And when importing from actual component files, include their correct extension:

```javascript
// In src/lower-components/LandingPage.js
// Incorrect:
export { LandingPage } from '../components/LandingPage';

// Correct:
export { LandingPage } from '../components/LandingPage.tsx';
```

When importing from our bridge in App.tsx or other files:

```typescript
// Incorrect:
import { LandingPage, ErrorBoundary } from './lower-components';

// Correct:
import { LandingPage, ErrorBoundary } from './lower-components/index.js';
```

### Webpack Configurations

For webpack configurations that reference browser polyfills, make sure to include the file extension:

```javascript
// Incorrect
webpackConfig.resolve.alias = {
  process: 'process/browser',
};

// Correct
webpackConfig.resolve.alias = {
  process: 'process/browser.js',
};
```

When modifying configuration files or scripts, make sure to use the proper module syntax:

```javascript
// ES Modules (correct)
import webpack from 'webpack';
export default { /* config */ };

// CommonJS (incorrect for this project)
const webpack = require('webpack');
module.exports = { /* config */ };
```

## How to Fix Case Sensitivity Errors

When you encounter a Netlify build error like:

```
Module not found: Error: Can't resolve './components/SomeComponent'
```

Follow these steps:

1. Run the helper script:
   ```bash
   # For component directly in components directory
   node create-component-bridge.js SomeComponent
   
   # For component in a subdirectory (e.g., components/auth/SomeComponent)
   node create-component-bridge.js SomeComponent auth
   ```

2. Update your imports:
   ```javascript
   // Change this:
   import { SomeComponent } from './components/SomeComponent';
   
   // To this:
   import { SomeComponent } from './lower-components';
   ```

3. Commit and push your changes:
   ```bash
   git add src/lower-components/SomeComponent.js src/lower-components/index.js
   git add [file with updated import]
   git commit -m "Add SomeComponent bridge to fix case sensitivity"
   git push
   ```

## Best Practices

1. Use consistent naming conventions for files and directories
2. Prefer lowercase for directory names
3. For new components, update the imports to use the bridge immediately
4. When refactoring, consider moving components to a case-consistent structure
5. Ensure all JS configuration files use ES module syntax

## Adding to an Existing Project

If you're adding the case sensitivity solution to an existing project:

1. Create the lower-components directory and index.js
2. Create bridge files for components that have case sensitivity issues
3. Update imports in your application
4. Add the .gitattributes file
5. Add the create-component-bridge.js helper script 