const path = require('path');

module.exports = {
  babel: {
    presets: [
      '@babel/preset-env',
      '@babel/preset-react'
    ],
    plugins: [
      '@babel/plugin-transform-runtime'
    ],
    env: {
      development: {
        plugins: ['react-refresh/babel']
      }
    }
  },
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      const isEnvDevelopment = process.env.NODE_ENV === 'development';
      const isEnvProduction = process.env.NODE_ENV === 'production';

      console.log('Current NODE_ENV:', process.env.NODE_ENV);
      console.log('Is Development:', isEnvDevelopment);
      console.log('Is Production:', isEnvProduction);

      // Fix for the date-fns conflicting star exports issue
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        // Replace the entire date-fns module with our patched version
        'date-fns': path.resolve(__dirname, 'src/utils/patchedDateFns.js'),
        'date-fns/index': path.resolve(__dirname, 'src/utils/patchedDateFns.js'),
        
        // Redirect specific conflicting modules to our import fixer
        './_lib/format/longFormatters/index.js': path.resolve(__dirname, 'src/utils/importFixer.js'),
        'date-fns/parse': path.resolve(__dirname, 'src/utils/importFixer.js'),
        'date-fns/format': path.resolve(__dirname, 'src/utils/importFixer.js'),
        
        // Additional module aliases
        'date-fns/locale': path.resolve(__dirname, 'src/utils/dateUtils.js')
      };
      
      // Add rules for our custom files
      webpackConfig.module.rules.push({
        test: /src\/utils\/(dateUtils|importFixer|patchedDateFns)\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react'
            ],
            plugins: [
              '@babel/plugin-transform-runtime',
              ...(isEnvDevelopment ? ['react-refresh/babel'] : [])
            ]
          }
        }
      });
      
      // Explicitly prevent bundling of specific problematic modules
      webpackConfig.module.rules.push({
        test: /node_modules\/date-fns\/(parse|format|index)\.js$/,
        use: 'null-loader',
      });
      
      // Set the optimization settings to help with module conflicts
      if (webpackConfig.optimization) {
        webpackConfig.optimization.minimize = isEnvProduction;
        
        if (!webpackConfig.optimization.splitChunks) {
          webpackConfig.optimization.splitChunks = {};
        }
        
        // Adjust cacheGroups to separate date-related modules
        webpackConfig.optimization.splitChunks.cacheGroups = {
          ...webpackConfig.optimization.splitChunks.cacheGroups,
          dateVendor: {
            test: /[\\/]node_modules[\\/](dayjs|date-fns)[\\/]/,
            name: 'date-vendor',
            chunks: 'all',
            priority: 10
          }
        };
      }

      // Handle React Refresh only in development
      if (isEnvDevelopment) {
        console.log('Setting up React Refresh for development');
        const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
        
        // Remove any existing React Refresh plugins
        webpackConfig.plugins = (webpackConfig.plugins || []).filter(
          (plugin) => 
            !plugin.constructor.name.includes('ReactRefreshPlugin') &&
            !plugin.constructor.name.includes('ReactRefreshWebpackPlugin')
        );
        
        // Add our configured React Refresh plugin
        webpackConfig.plugins.push(
          new ReactRefreshWebpackPlugin({
            overlay: false,
            include: /\.([jt]sx?|flow)$/i,
            exclude: [/node_modules/, /bower_components/],
          })
        );
      } else {
        console.log('Production build - removing React Refresh');
        // Remove any React Refresh related code in production
        webpackConfig.plugins = (webpackConfig.plugins || []).filter(
          (plugin) => 
            !plugin.constructor.name.includes('ReactRefreshPlugin') &&
            !plugin.constructor.name.includes('ReactRefreshWebpackPlugin')
        );
      }
      
      return webpackConfig;
    }
  }
}; 