/**
 * @return {boolean} true in browser environment.
 */
function isClient() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export { isClient };
