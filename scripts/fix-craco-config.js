import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// ESM-compatible craco config
const esmCracoConfig = `// Import webpack instead of requiring it
import webpack from 'webpack';
// Import other dependencies
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import cryptoBrowserify from 'crypto-browserify';
import streamBrowserify from 'stream-browserify';
import assert from 'assert';
import streamHttp from 'stream-http';
import httpsBrowserify from 'https-browserify';
import osBrowserify from 'os-browserify';
import url from 'url';
import util from 'util';
import buffer from 'buffer';
import pathBrowserify from 'path-browserify';
import processBrowser from 'process/browser.js';

// Use export default instead of module.exports
export default {
  style: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: cryptoBrowserify,
        stream: streamBrowserify,
        assert: assert,
        http: streamHttp,
        https: httpsBrowserify,
        os: osBrowserify,
        url: url,
        util: util,
        buffer: buffer,
        path: pathBrowserify,
        process: processBrowser,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        vm: false,
        'pg-native': false,
      };

      webpackConfig.plugins = [
        ...(webpackConfig.plugins || []),
        new webpack.ProvidePlugin({
          process: ['process/browser.js'],
          Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        }),
      ];

      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        process: 'process/browser.js',
      };

      webpackConfig.module = {
        ...webpackConfig.module,
        rules: [
          ...(webpackConfig.module?.rules || []),
          {
            test: /\.m?js/,
            resolve: {
              fullySpecified: false,
            },
          },
        ],
      };

      return webpackConfig;
    },
  },
};`;

// Install missing dependencies
const installMissingDependencies = () => {
  try {
    console.log('Installing missing dependencies...');
    execSync('npm install react-icons@^4.12.0', { stdio: 'inherit', cwd: rootDir });
    console.log('Dependencies installed successfully!');
  } catch (error) {
    console.error('Error installing dependencies:', error);
  }
};

// Main function
const main = () => {
  try {
    const configPath = path.join(rootDir, 'craco.config.js');
    
    console.log('Updating craco.config.js for ESM compatibility...');
    
    // Backup the existing file
    if (fs.existsSync(configPath)) {
      const backupPath = path.join(rootDir, 'craco.config.js.bak');
      fs.copyFileSync(configPath, backupPath);
      console.log(`Backed up existing config to ${backupPath}`);
    }
    
    // Write the new file
    fs.writeFileSync(configPath, esmCracoConfig, 'utf8');
    console.log('Updated craco.config.js successfully!');
    
    // Install missing dependencies
    installMissingDependencies();
    
    console.log('\nAll fixes complete!');
    console.log('You can now run the application with:');
    console.log('npm run dev');
    
  } catch (error) {
    console.error('Error running the script:', error);
    process.exit(1);
  }
};

// Run the script
main(); 