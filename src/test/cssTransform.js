/**
 * CSS transform for Jest
 * This module returns an empty object for CSS imports
 */

export default {
  process() {
    return { code: 'export default {};' };
  },
  getCacheKey() {
    return 'cssTransform';
  },
}; 