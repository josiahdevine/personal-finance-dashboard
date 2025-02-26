const path = require('path');

module.exports = {
  resolve: {
    alias: {
      // Fix date-fns conflict by ensuring a single version is used
      'date-fns': path.resolve(__dirname, 'node_modules/date-fns')
    }
  }
}; 