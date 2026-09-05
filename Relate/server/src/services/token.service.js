'use strict';

const crypto = require('crypto');

/**
 * Generate a cryptographically secure plaintext token.
 * Uses 32 random bytes encoded as hex → 64-character hex string.
 *
 * @returns {string} 64-char hex plaintext token
 */
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a plaintext token using SHA-256.
 *
 * @param {string} plaintext — the raw token returned by generateToken()
 * @returns {string} SHA-256 hex digest of the plaintext
 */
function hashToken(plaintext) {
  return crypto.createHash('sha256').update(plaintext).digest('hex');
}

module.exports = { generateToken, hashToken };
