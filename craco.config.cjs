// CommonJS version of craco.config.js
const webpack = require('webpack');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = {
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
      // Add React Refresh Webpack Plugin in development
      if (process.env.NODE_ENV === 'development') {
        webpackConfig.plugins = [
          ...(webpackConfig.plugins || []),
          new ReactRefreshWebpackPlugin({
            overlay: {
              sockIntegration: 'wds',
            },
          }),
        ];
      }
      
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        assert: require.resolve('assert'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify'),
        url: require.resolve('url'),
        util: require.resolve('util'),
        buffer: require.resolve('buffer'),
        path: require.resolve('path-browserify'),
        process: require.resolve('process/browser'),
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
          process: ['process/browser'],
          Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        }),
      ];

      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        process: 'process/browser',
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
  // Add Babel configuration to address React Refresh error
  babel: {
    plugins: [
      // Add React Refresh with skipEnvCheck to prevent production build errors
      process.env.NODE_ENV !== 'production' ? 
        ['react-refresh/babel', { skipEnvCheck: true }] : null
    ].filter(Boolean),
  },
}; 