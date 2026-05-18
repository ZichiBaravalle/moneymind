// Chrome object polyfill for browsers that don't have it
// Prevents "chrome is not defined" errors from third-party scripts
if (typeof chrome === 'undefined') {
  window.chrome = {
    runtime: {}
  };
}
