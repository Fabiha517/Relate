'use strict';

const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

// ── Shared handler ────────────────────────────────────────────────────────────
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please wait and try again.'
    }
  });
};

// ── Key generators ────────────────────────────────────────────────────────────

/**
 * For POST /api/analogies/generate:
 *   - Authenticated: decode the `token` cookie and use `userId` as the key.
 *     jwt.decode() is intentionally used here (not verify) — rate-limit keying
 *     only needs the userId claim; full auth verification is done separately.
 *   - Unauthenticated (no cookie or undecodable token): fall back to req.ip.
 */
function analogyGenerateKeyGenerator(req) {
  try {
    const token = req.cookies?.token;
    if (token) {
      const decoded = jwt.decode(token);
      if (decoded?.userId) {
        return String(decoded.userId);
      }
    }
  } catch {
    // fall through to IP-based key
  }
  return req.ip;
}

/**
 * For practice endpoints that require auth:
 *   requireAuth sets req.user before the rate limiter runs,
 *   so req.user.userId is available. Falls back to IP defensively.
 */
function userIdKeyGenerator(req) {
  return req.user?.userId ? String(req.user.userId) : req.ip;
}

// ── Rate limiter instances ────────────────────────────────────────────────────

/** POST /api/analogies/generate — 10 req / 15 min, keyed by userId or IP */
const analogyGenerateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  keyGenerator: analogyGenerateKeyGenerator,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false
});

/** POST /api/practice/questions — 20 req / 15 min, keyed by userId */
const practiceQuestionsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  keyGenerator: userIdKeyGenerator,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false
});

/** POST /api/practice/questions/more — 20 req / 15 min, keyed by userId */
const practiceQuestionsMoreLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  keyGenerator: userIdKeyGenerator,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false
});

/** POST /api/practice/evaluate — 60 req / 15 min, keyed by userId */
const practiceEvaluateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  keyGenerator: userIdKeyGenerator,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false
});

/** POST /api/auth/login — 10 req / 15 min, keyed by IP */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  keyGenerator: (req) => req.ip,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false
});

/** POST /api/auth/forgot-password — 5 req / 60 min, keyed by IP */
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  keyGenerator: (req) => req.ip,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  analogyGenerateLimiter,
  practiceQuestionsLimiter,
  practiceQuestionsMoreLimiter,
  practiceEvaluateLimiter,
  loginLimiter,
  forgotPasswordLimiter
};
