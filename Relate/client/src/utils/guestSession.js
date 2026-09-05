/**
 * Guest session storage wrapper for managing guestAnalogy in sessionStorage
 * Handles JSON serialization/deserialization with graceful error handling
 */

const GUEST_ANALOGY_KEY = 'guestAnalogy';

/**
 * Stores an analogy object in sessionStorage
 * 
 * @param {Object} analogy - The analogy data to store
 * @returns {void}
 */
export function set(analogy) {
  try {
    sessionStorage.setItem(GUEST_ANALOGY_KEY, JSON.stringify(analogy));
  } catch (error) {
    // Silently fail if sessionStorage is unavailable or quota exceeded
    console.error('Failed to set guest analogy in sessionStorage:', error);
  }
}

/**
 * Retrieves the analogy object from sessionStorage
 * 
 * @returns {Object|null} The parsed analogy object, or null if absent or invalid
 */
export function get() {
  try {
    const stored = sessionStorage.getItem(GUEST_ANALOGY_KEY);
    if (stored === null) {
      return null;
    }
    return JSON.parse(stored);
  } catch (error) {
    // Return null if parsing fails or sessionStorage is unavailable
    console.error('Failed to get guest analogy from sessionStorage:', error);
    return null;
  }
}

/**
 * Clears the guest analogy from sessionStorage
 * 
 * @returns {null}
 */
export function clear() {
  try {
    sessionStorage.removeItem(GUEST_ANALOGY_KEY);
  } catch (error) {
    // Silently fail if sessionStorage is unavailable
    console.error('Failed to clear guest analogy from sessionStorage:', error);
  }
  return null;
}
