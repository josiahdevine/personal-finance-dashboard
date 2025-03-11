/**
 * @deprecated This file is deprecated. Please import from server/controllers/PlaidController.js instead.
 * This re-export is maintained for backward compatibility and will be removed in a future release.
 */

const PlaidController = require('../controllers/PlaidController');

// Log a deprecation warning when this file is imported
console.warn('[DEPRECATED] server/controller/PlaidController.js is deprecated. Please update imports to use server/controllers/PlaidController.js instead.');

// Re-export the consolidated controller
module.exports = PlaidController; 