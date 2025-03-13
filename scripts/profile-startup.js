/**
 * Startup Performance Profiler
 * 
 * This script measures the startup time for the development server and identifies
 * potential bottlenecks in the build process.
 * 
 * Usage:
 * node scripts/profile-startup.js
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  START_COMMAND: 'cross-env PROFILE=true PORT=3000 BROWSER=none FAST_REFRESH=false craco start',
  TEMP_LOG_FILE: path.join(__dirname, '../temp-startup-log.txt'),
  RESULTS_FILE: path.join(__dirname, '../startup-profile-results.json'),
  TIMEOUT_MS: 2 * 60 * 1000, // 2 minutes timeout
  PATTERN_SERVER_STARTED: 'webpack compiled successfully',
  ANALYZE_DEPENDENCIES: true
};

// Module timing data
let moduleTimings = [];
let slowestModules = [];
let largestModules = [];
let startTime;

console.log(chalk.cyan('Starting development server profiling...'));
console.log(chalk.gray('This may take a minute. Please wait for results.'));

// Create a temp file for logging
fs.writeFileSync(CONFIG.TEMP_LOG_FILE, '');

// Start the server with timing information
startTime = Date.now();

const serverProcess = spawn(CONFIG.START_COMMAND, {
  shell: true,
  env: {
    ...process.env,
    CRACO_WEBPACK_PROFILE: 'true',
    WEBPACK_PROFILE: 'true',
  }
});

// Set timeout
const timeout = setTimeout(() => {
  console.log(chalk.red('Timeout waiting for server to start!'));
  killProcess();
  process.exit(1);
}, CONFIG.TIMEOUT_MS);

// Process stdout
serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  fs.appendFileSync(CONFIG.TEMP_LOG_FILE, output);
  
  // Check for webpack compilation completion
  if (output.includes(CONFIG.PATTERN_SERVER_STARTED)) {
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;
    
    // Collect results
    analyzeResults(totalTime);
    
    // Kill the server process
    killProcess();
  }
});

// Process stderr
serverProcess.stderr.on('data', (data) => {
  const output = data.toString();
  fs.appendFileSync(CONFIG.TEMP_LOG_FILE, output);
  
  // Capture module timing data from webpack output
  if (output.includes('modules by path')) {
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.includes('ms') && line.includes('modules by path')) {
        const match = line.match(/(\d+) ms .+modules by path (.+)/);
        if (match) {
          moduleTimings.push({
            time: parseInt(match[1]),
            path: match[2].trim()
          });
        }
      }
    }
  }
});

// Process exit
serverProcess.on('close', (code) => {
  if (code !== null && code !== 0) {
    console.log(chalk.red(`Server process exited with code ${code}`));
    // We can still try to analyze results even if the process failed
    analyzeResults(-1);
  }
});

// Kill the server process and clear timeout
function killProcess() {
  clearTimeout(timeout);
  serverProcess.kill();
}

// Analyze the results
function analyzeResults(totalTime) {
  console.log(chalk.green('\n==== Development Server Startup Profile ===='));
  console.log(chalk.green(`Total startup time: ${totalTime.toFixed(2)} seconds`));

  if (moduleTimings.length > 0) {
    // Sort modules by time
    moduleTimings.sort((a, b) => b.time - a.time);
    slowestModules = moduleTimings.slice(0, 10);
    
    console.log(chalk.yellow('\nSlowest Modules:'));
    slowestModules.forEach((module, index) => {
      console.log(chalk.yellow(`${index + 1}. ${module.path}: ${module.time}ms`));
    });
  }

  // Check for dependency issues
  if (CONFIG.ANALYZE_DEPENDENCIES) {
    analyzeDependencies();
  }

  // Save results to file
  const results = {
    timestamp: new Date().toISOString(),
    totalStartupTime: totalTime,
    slowestModules,
    largestModules,
    recommendations: generateRecommendations()
  };

  fs.writeFileSync(CONFIG.RESULTS_FILE, JSON.stringify(results, null, 2));
  console.log(chalk.green(`\nResults saved to ${CONFIG.RESULTS_FILE}`));
  
  // Clean up temp file
  fs.unlinkSync(CONFIG.TEMP_LOG_FILE);
}

// Analyze package dependencies for issues
async function analyzeDependencies() {
  try {
    const packageJsonPath = path.join(__dirname, '../package.json');
    const packageLockPath = path.join(__dirname, '../package-lock.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      console.log(chalk.red('package.json not found!'));
      return;
    }
    
    // Use dynamic import for JSON files
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // Identify potentially duplicate packages
    const duplicatePackages = await findDuplicatePackageVersions(packageLockPath);
    if (duplicatePackages.length > 0) {
      console.log(chalk.yellow('\nPotential Duplicate Packages:'));
      duplicatePackages.forEach(pkg => {
        console.log(chalk.yellow(`- ${pkg.name}: ${pkg.versions.join(', ')}`));
      });
    }
    
    // Identify large dependencies
    const dependencyList = Object.keys(dependencies).map(name => ({ name, version: dependencies[name] }));
    console.log(chalk.yellow('\nPotentially Large Dependencies:'));
    
    // List of known large dependencies that might impact startup time
    const knownLargeDeps = [
      '@material-ui/core', 'moment', 'lodash', 'recharts', 'chart.js', 
      'firebase', 'aws-sdk', '@aws-amplify/core', 'monaco-editor',
      'antd', 'styled-components', 'three.js', 'react-bootstrap'
    ];
    
    const largeDepsFound = dependencyList.filter(dep => 
      knownLargeDeps.some(largeDep => dep.name.includes(largeDep))
    );
    
    largeDepsFound.forEach(dep => {
      console.log(chalk.yellow(`- ${dep.name}: ${dep.version}`));
    });
  } catch (error) {
    console.log(chalk.red('Error analyzing dependencies:'), error.message);
  }
}

// Find duplicate package versions in package-lock.json
async function findDuplicatePackageVersions(packageLockPath) {
  if (!fs.existsSync(packageLockPath)) {
    return [];
  }
  
  try {
    // Use dynamic import for JSON files
    const packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));
    const packages = packageLock.dependencies || {};
    
    // Map to track package versions
    const packageVersions = {};
    
    // Function to recursively scan dependencies
    function scanDependencies(deps, path = '') {
      for (const [name, info] of Object.entries(deps)) {
        const fullName = `${path}${name}`;
        if (!packageVersions[name]) {
          packageVersions[name] = [];
        }
        
        if (info.version && !packageVersions[name].includes(info.version)) {
          packageVersions[name].push(info.version);
        }
        
        // Scan nested dependencies
        if (info.dependencies) {
          scanDependencies(info.dependencies, `${fullName}/node_modules/`);
        }
      }
    }
    
    scanDependencies(packages);
    
    // Filter for packages with multiple versions
    return Object.entries(packageVersions)
      .filter(([_, versions]) => versions.length > 1)
      .map(([name, versions]) => ({ name, versions }));
      
  } catch (error) {
    console.log(chalk.red('Error analyzing package-lock.json:'), error.message);
    return [];
  }
}

// Generate recommendations based on analysis
function generateRecommendations() {
  const recommendations = [
    "Use React.lazy() and Suspense for code-splitting large components",
    "Consider replacing large dependencies with smaller alternatives",
    "Implement dynamic imports for less frequently used modules",
    "Ensure you're using production builds of libraries when available",
    "Add Webpack bundle analyzer to identify large chunks",
    "Consider tree-shaking unused code with a custom webpack configuration",
    "Use incremental builds in development mode"
  ];
  
  if (moduleTimings.length > 0) {
    const slowestModule = moduleTimings[0];
    if (slowestModule.path.includes('node_modules')) {
      recommendations.push(`Optimize the slowest module: ${slowestModule.path}`);
    }
  }
  
  return recommendations;
}

// Handle SIGINT
process.on('SIGINT', () => {
  console.log(chalk.yellow('\nProfiling interrupted by user.'));
  killProcess();
  process.exit(0);
}); 