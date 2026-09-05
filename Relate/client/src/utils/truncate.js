/**
 * Truncates a string to a maximum length and appends ellipsis if truncated
 * 
 * @param {String} str - The string to truncate
 * @param {Number} maxLen - Maximum length for the string (including ellipsis)
 * @returns {String} Truncated string with ellipsis if over limit, or original string if under limit
 */
export function truncate(str, maxLen) {
  if (str.length <= maxLen) {
    return str;
  }
  
  // Handle edge case: if maxLen < 3, still append ellipsis
  if (maxLen < 3) {
    return str.substring(0, maxLen) + '...';
  }
  
  return str.substring(0, maxLen - 3) + '...';
}
