'use strict';

const mongoose = require('mongoose');

const resetTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // SHA-256 hash of the plaintext token — NEVER store the plaintext (Requirement 16.16)
  tokenHash: {
    type: String,
    required: true
  },
  used: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Required: set to Date.now + 1 hour at creation time
  expiresAt: {
    type: Date,
    required: true
  }
});

// TTL index — MongoDB auto-removes expired tokens
resetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for efficient lookup by hash on reset submission
resetTokenSchema.index({ tokenHash: 1 });

module.exports = mongoose.model('ResetToken', resetTokenSchema);
