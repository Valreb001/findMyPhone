/**
 * client/src/utils/roomGenerator.js
 * Generate unique room codes for tracking sessions
 */

/**
 * Generate a random alphanumeric room code
 * Format: 6 characters (uppercase letters and numbers)
 * Examples: A7K9F2, PHONE8X, X3P7TQ
 * @returns {string} Generated room code
 */
export function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';

  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
}

/**
 * Validate room code format
 * @param {string} code - Room code to validate
 * @returns {boolean} True if valid format
 */
export function isValidRoomCode(code) {
  return typeof code === 'string' && /^[A-Z0-9]{6}$/.test(code);
}

/**
 * Format room code for display
 * @param {string} code - Raw room code
 * @returns {string} Formatted code with spacing
 */
export function formatRoomCode(code) {
  if (!isValidRoomCode(code)) return code;
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}

/**
 * Get shareable owner URL
 * @param {string} roomCode - Room code
 * @param {string} baseUrl - Base URL (defaults to current origin)
 * @returns {string} Full shareable URL
 */
export function getShareableOwnerUrl(roomCode, baseUrl = window.location.origin) {
  return `${baseUrl}/?room=${roomCode}`;
}
