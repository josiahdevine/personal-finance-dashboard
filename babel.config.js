module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: 'commonjs', // Transform ES modules to CommonJS
      },
    ],
    '@babel/preset-react',
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-class-properties',
  ],
}; 