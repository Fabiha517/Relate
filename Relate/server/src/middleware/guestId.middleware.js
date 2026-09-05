'use strict';

const crypto = require('crypto');
const config = require('../config/env');

/**
 * guestId middleware
 *
 * Reads the `guestId` cookie from the incoming request.
 * - If present:  attaches the existing value to `req.guestId` and continues.
 * - If absent:   generates a new UUID, attaches it to `req.guestId`, and sets
 *   a persistent HttpOnly cookie on the response so the same identifier is
 *   reused across browser sessions (Max-Age rather than session-cookie).
 *
 * Cookie attributes:
 *   HttpOnly     — not accessible from JavaScript
 *   SameSite=Strict — CSRF mitigation
 *   Max-Age      — from config.guestCookieMaxAgeMs (default 30 days = 2 592 000 000 ms)
 *
 * Requirements: 6.3, 6.10
 */
function guestIdMiddleware(req, res, next) {
  const existing = req.cookies && req.cookies.guestId;

  if (existing) {
    req.guestId = existing;
    return next();
  }

  const newId = crypto.randomUUID();
  req.guestId = newId;

  res.cookie('guestId', newId, {
    httpOnly: true,
    sameSite: 'Strict',
    maxAge: config.guestCookieMaxAgeMs,
    // secure is intentionally omitted here so the cookie works in local HTTP
    // development; the production reverse-proxy / TLS terminator should
    // enforce HTTPS before this middleware sees the request.
    secure: config.nodeEnv === 'production'
  });

  return next();
}

module.exports = guestIdMiddleware;
