module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current'
      },
      modules: 'auto'
    }],
    ['@babel/preset-react', {
      runtime: 'automatic'
    }],
    '@babel/preset-typescript'
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      regenerator: true,
      helpers: true,
      useESModules: true
    }],
    '@babel/plugin-transform-modules-commonjs',
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-private-methods', { loose: true }],
    ['@babel/plugin-proposal-private-property-in-object', { loose: true }]
  ],
  env: {
    development: {
      plugins: [
        ['react-refresh/babel', { skipEnvCheck: true }]
      ]
    },
    production: {
      // No react-refresh in production
    },
    test: {
      plugins: [
        '@babel/plugin-transform-modules-commonjs'
      ]
    }
  }
}; 