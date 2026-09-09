
'use strict';

const jwt = require('jsonwebtoken');

const config = require('../config/env');

/**
 * requireAuth — Express middleware that enforces JWT authentication.
 *
 * Reads the `token` HttpOnly cookie set at login.
 * On success: populates req.user = { userId, email } from JWT claims only.
 * On failure: returns 401 with a structured AUTH_ERROR response.
 */
function requireAuth(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication required.'
      }
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    // Populate req.user from JWT claims only — never from req.body
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    next();
  } catch {
    return res.status(401).json({
      error: {
        code: 'AUTH_ERROR',
        message: 'Session expired or invalid.'
      }
    });
  }
}

/**
 * optionalAuth — Express middleware that attempts JWT authentication
 * but allows unauthenticated requests to continue as guests.
 *
 * Reads the same `token` HttpOnly cookie used by requireAuth.
 *
 * On valid token:
 *   req.user = { userId, email }
 *
 * On missing/invalid/expired token:
 *   req.user remains undefined and the request continues.
 */
function optionalAuth(req, res, next) {
  const token = req.cookies?.token;

  c

  if (!token) {
   
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    console.log('→ AUTHENTICATED');
    console.log('req.user:', req.user);
  } catch (err) {
    console.log('→ TOKEN INVALID:', err.message);
  }

  next();
}

module.exports = {
  requireAuth,
  optionalAuth
};
