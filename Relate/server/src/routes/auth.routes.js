'use strict';

const express = require('express');

const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const {
  sanitize,
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateUpdateProfile,
  validateChangePassword
} = require('../middleware/validate.middleware');
const { loginLimiter, forgotPasswordLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// ── POST /api/auth/register ───────────────────────────────────────────────────
// Sanitize → validate → register
router.post(
  '/register',
  sanitize(['name', 'email']),
  validateRegister,
  authController.register
);

// ── POST /api/auth/login ──────────────────────────────────────────────────────
// Rate-limited → sanitize → validate → login
router.post(
  '/login',
  loginLimiter,
  sanitize(['email']),
  validateLogin,
  authController.login
);

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
router.post('/logout', authController.logout);

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
// Protected — requireAuth enforces valid JWT cookie
router.get('/me', requireAuth, authController.me);

// ── POST /api/auth/forgot-password ────────────────────────────────────────────
// Rate-limited → sanitize → validate → forgot password
router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  sanitize(['email']),
  validateForgotPassword,
  authController.forgotPassword
);

// ── POST /api/auth/reset-password ─────────────────────────────────────────────
router.post(
  '/reset-password',
  validateResetPassword,
  authController.resetPassword
);


// -- PUT /api/auth/profile -----------------------------------------------------
// Protected � requireAuth enforces valid JWT cookie
router.put(
  '/profile',
  requireAuth,
  sanitize(['name']),
  validateUpdateProfile,
  authController.updateProfile
);

// -- PUT /api/auth/password ----------------------------------------------------
// Protected � requireAuth enforces valid JWT cookie
router.put(
  '/password',
  requireAuth,
  validateChangePassword,
  authController.changePassword
);
module.exports = router;

