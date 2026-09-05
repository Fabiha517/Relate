'use strict';

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  // bcryptjs hash — plaintext password is NEVER stored
  passwordHash: {
    type: String,
    required: true
  },
  // confirmPassword is deliberately ABSENT from this schema (Requirement 7.8)
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index: unique email (declared inline above; explicit compound below for clarity)
userSchema.index({ email: 1 }, { unique: true });

// Pre-save hook: keep updatedAt current
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
