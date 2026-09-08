'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const config = require('../config/env');
const User = require('../models/User.model');
const ResetToken = require('../models/ResetToken.model');
const Analogy = require('../models/Analogy.model');
const tokenService = require('../services/token.service');
const emailService = require('../services/email/email.service');
const { validateAIResponse } = require('../services/ai/validators/aiResponse.validator');
const { sanitizeGuestAnalogy } = require('./analogy.controller');

// -- Helpers -------------------------------------------------------------------

/**
 * Build and set the JWT HttpOnly cookie on the response.
 * Cookie attributes follow the design spec (task 4.2):
 *   httpOnly, secure in production, sameSite Strict, 7-day maxAge.
 *
 * @param {object} res  - Express response object
 * @param {object} user - Mongoose User document
 */
function setAuthCookie(res, user) {
  const jwtToken = jwt.sign(
    { userId: user._id, email: user.email },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  res.cookie('token', jwtToken, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
  });

  return jwtToken;
}

/**
 * Shape the user document into the public profile payload.
 *
 * @param {object} user - Mongoose User document
 * @returns {{ id, name, email, createdAt }}
 */
function formatUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  };
}

// -- Controllers ---------------------------------------------------------------

/**
 * POST /api/auth/register
 *
 * Body: { name, email, password, guestAnalogy? }
 *
 * 1. Hash password with bcrypt (12 rounds)
 * 2. Create User record
 * 3. If guestAnalogy present: sanitize ? validate ? save as Analogy (non-blocking)
 * 4. Issue JWT cookie
 * 5. Return 201 { user }
 */
async function register(req, res) {
  try {
    const { name, email, password, guestAnalogy } = req.body;

    // Hash password � plaintext is never stored
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user � duplicate email throws MongoServerError code 11000
    let user;
    try {
      user = await User.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash
      });
    } catch (dbErr) {
      // Duplicate key error � email already registered
      if (dbErr.code === 11000) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed.',
            fields: {
              email: 'An account with this email is already registered.'
            }
          }
        });
      }
      throw dbErr; // re-throw unexpected DB errors
    }

    // Optional guestAnalogy transfer � non-blocking (failures must not fail registration)
    if (guestAnalogy !== undefined && guestAnalogy !== null) {
      try {
        // Sanitize the guest analogy before validation (removes HTML, MongoDB injection patterns)
        const sanitized = sanitizeGuestAnalogy(guestAnalogy);

        // Validate the AI_Response schema after sanitization
        validateAIResponse(sanitized);

        // Save as a new Analogy document linked to the new user
        await Analogy.create({
          userId: user._id,
          analogyTitle: sanitized.analogyTitle,
          concept: sanitized.concept || '',
          analogyWorld: sanitized.analogyWorld || '',
          nodes: sanitized.nodes,
          mappings: sanitized.mappings,
          relationships: sanitized.relationships,
          explanation: sanitized.explanation,
          limitations: sanitized.limitations
        });
      } catch {
        // Validation failure OR save failure � silently skip (non-blocking per spec)
        // Registration still succeeds even if guestAnalogy transfer fails
      }
    }

    // Issue JWT cookie and return user profile
    setAuthCookie(res, user);

    return res.status(201).json({ user: formatUser(user) });
  } catch (err) {
    console.error('[auth.controller] register error:', err.message);
    return res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Registration failed. Please try again.' }
    });
  }
}

/**
 * POST /api/auth/login
 *
 * Body: { email, password }
 *
 * Generic 401 on any credential mismatch � never reveal which field is wrong.
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    // Email does not belong to an existing account
    if (!user) {
      return res.status(401).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'No account found with this email.',
        },
      });
    }

    // Account exists, now verify password
    const passwordMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Incorrect password. Please try again.',
        },
      });
    }

    setAuthCookie(res, user);

    return res.status(200).json({
      user: formatUser(user),
    });
  } catch (err) {
    console.error('[auth.controller] login error:', err.message);

    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Login failed. Please try again.',
      },
    });
  }
}

/**
 * POST /api/auth/logout
 *
 * Clears the JWT cookie and returns a confirmation message.
 */
function logout(req, res) {
  res.cookie('token', '', {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'Strict',
    maxAge: 0
  });

  return res.status(200).json({ message: 'Logged out.' });
}

/**
 * GET /api/auth/me
 *
 * Protected by requireAuth middleware � req.user is guaranteed to have { userId, email }.
 * Fetches the full user record to return name and createdAt.
 */
async function me(req, res) {
  try {
    const user = await User.findById(req.user.userId).select('name email createdAt');

    if (!user) {
      // Edge case: user was deleted after the JWT was issued
      return res.status(401).json({
        error: { code: 'AUTH_ERROR', message: 'User not found.' }
      });
    }

    return res.status(200).json({ user: formatUser(user) });
  } catch (err) {
    console.error('[auth.controller] me error:', err.message);
    return res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Could not retrieve user data.' }
    });
  }
}

/**
 * PUT /api/auth/profile
 *
 * Body: { name }
 *
 * Updates the authenticated user's profile information.
 * Protected by requireAuth middleware � req.user contains { userId, email }.
 */
async function updateProfile(req, res) {
  try {
    const { name } = req.body;

    // Update user name
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { 
        name: name.trim(),
        updatedAt: new Date()
      },
      { new: true, select: 'name email createdAt' }
    );

    if (!updatedUser) {
      return res.status(401).json({
        error: { code: 'AUTH_ERROR', message: 'User not found.' }
      });
    }

    return res.status(200).json({ 
      user: formatUser(updatedUser),
      message: 'Profile updated successfully.'
    });
  } catch (err) {
    console.error('[auth.controller] updateProfile error:', err.message);
    return res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Profile update failed. Please try again.' }
    });
  }
}

/**
 * PUT /api/auth/password
 *
 * Body: { currentPassword, newPassword }
 *
 * Changes the authenticated user's password.
 * Protected by requireAuth middleware � req.user contains { userId, email }.
 */
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    // Fetch user with password hash for verification
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(401).json({
        error: { code: 'AUTH_ERROR', message: 'User not found.' }
      });
    }

    // Verify current password
    const currentPasswordMatch = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!currentPasswordMatch) {
      return res.status(400).json({
        error: {
          code: 'INVALID_CURRENT_PASSWORD',
          message: 'Current password is incorrect.'
        }
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await User.findByIdAndUpdate(
      req.user.userId,
      { 
        passwordHash: newPasswordHash,
        updatedAt: new Date()
      }
    );

    return res.status(200).json({ 
      message: 'Password changed successfully.'
    });
  } catch (err) {
    console.error('[auth.controller] changePassword error:', err.message);
    return res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Password change failed. Please try again.' }
    });
  }
}

/**
 * POST /api/auth/forgot-password
 *
 * Body: { email }
 *
 * Always returns 200 with the same message � enumeration-safe (Req 16.x).
 * Side effect when email exists: generate token, store hash, send reset email.
 */
async function forgotPassword(req, res) {
  // Send the response immediately � processing continues but response is not awaited
  // This prevents timing-based email enumeration
  const SAFE_RESPONSE = {
    message: 'If an account with that email exists, a reset link has been sent.'
  };

  try {
    const { email } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      // Generate a cryptographically secure plaintext token
      const plaintext = tokenService.generateToken();
      const tokenHash = tokenService.hashToken(plaintext);

      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // now + 1 hour

      // Store ONLY the hash � plaintext is never persisted (Req 16.16)
      await ResetToken.create({
        userId: user._id,
        tokenHash,
        expiresAt
      });

      // Build the reset URL � plaintext token is embedded in the URL, not logged
      const resetUrl = `${config.clientOrigin}/reset?token=${plaintext}`;

      // Send email (non-blocking � fire and forget; failures should not affect response)
      emailService.sendPasswordResetEmail({ to: normalizedEmail, resetUrl }).catch(emailErr => {
        console.error('[auth.controller] forgotPassword email error:', emailErr.message);
      });
    }
  } catch (err) {
    // Log the error but always return the safe 200 response
    console.error('[auth.controller] forgotPassword error:', err.message);
  }

  return res.status(200).json(SAFE_RESPONSE);
}

/**
 * POST /api/auth/reset-password
 *
 * Body: { token, newPassword }
 *
 * 1. Hash the incoming token and look it up in ResetToken collection
 * 2. Validate: not expired, not used
 * 3. Update user's passwordHash, mark token as used
 */
async function resetPassword(req, res) {
  const INVALID_TOKEN_RESPONSE = {
    error: {
      code: 'RESET_TOKEN_INVALID',
      message: 'This reset link is invalid or has expired. Please request a new one.'
    }
  };

  try {
    const { token, newPassword } = req.body;

    // Hash the submitted token for lookup � plaintext is never stored
    const tokenHash = tokenService.hashToken(token.trim());

    const resetToken = await ResetToken.findOne({ tokenHash });

    // Not found, already used, or expired
    if (
      !resetToken ||
      resetToken.used ||
      resetToken.expiresAt <= new Date()
    ) {
      return res.status(400).json(INVALID_TOKEN_RESPONSE);
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update user password and mark token as used atomically
    const [updateResult] = await Promise.all([
      User.findByIdAndUpdate(resetToken.userId, { passwordHash, updatedAt: new Date() }),
      ResetToken.findByIdAndUpdate(resetToken._id, { used: true })
    ]);

    if (!updateResult) {
      // User was deleted between token creation and now � edge case
      return res.status(400).json(INVALID_TOKEN_RESPONSE);
    }

    return res.status(200).json({ message: 'Password reset successfully.' });
  } catch (err) {
    console.error('[auth.controller] resetPassword error:', err.message);
    return res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Password reset failed. Please try again.' }
    });
  }
}

// -- Exports -------------------------------------------------------------------

module.exports = {
  register,
  login,
  logout,
  me,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
};
