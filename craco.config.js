// Import webpack instead of requiring it
import webpack from 'webpack';
// Import other dependencies
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import crypto from 'crypto-browserify';
import streamBrowserify from 'stream-browserify';
import assert from 'assert';
import streamHttp from 'stream-http';
import httpsBrowserify from 'https-browserify';
import osBrowserify from 'os-browserify';
import url from 'url';
import util from 'util';
import buffer from 'buffer';
import pathBrowserify from 'path-browserify';
// Fix the process import by using process directly
import process from 'process';

// Export default config instead of using module.exports
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
        crypto: crypto,
        stream: streamBrowserify,
        assert: assert,
        http: streamHttp,
        https: httpsBrowserify,
        os: osBrowserify,
        url: url,
        util: util,
        buffer: buffer,
        path: pathBrowserify,
        // Change to use a string reference for process
        process: 'process/browser.js',
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
};