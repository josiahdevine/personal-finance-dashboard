module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start',
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['warn', { minScore: 0.6 }],
        'categories:accessibility': ['warn', { minScore: 0.8 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'categories:pwa': ['warn', { minScore: 0.5 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.25 }],
        'total-blocking-time': ['warn', { maxNumericValue: 600 }],
        'uses-http2': 'off',
        'redirects-http': 'off',
        'uses-long-cache-ttl': 'off',
        'canonical': 'off',
        'tap-targets': 'warn',
        'render-blocking-resources': 'warn',
        'unminified-css': 'warn',
        'unminified-javascript': 'warn',
        'unused-javascript': 'warn',
        'unused-css-rules': 'warn'
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}; 