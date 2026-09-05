'use strict';

/**
 * Global test setup — populates all required environment variables so
 * config/env.js does not call process.exit(1) when modules are imported
 * in unit tests.  Real values are never used — these are stubs.
 */
process.env.MONGODB_URI   = process.env.MONGODB_URI   || 'mongodb://localhost:27017/relate_test';
process.env.JWT_SECRET    = process.env.JWT_SECRET    || 'test-jwt-secret';
process.env.LLM_PROVIDER  = process.env.LLM_PROVIDER  || 'groq';
process.env.LLM_API_KEY   = process.env.LLM_API_KEY   || 'test-api-key';
process.env.LLM_MODEL     = process.env.LLM_MODEL     || 'test-model';
process.env.EMAIL_HOST    = process.env.EMAIL_HOST    || 'smtp.test.local';
process.env.EMAIL_USER    = process.env.EMAIL_USER    || 'test@test.local';
process.env.EMAIL_PASS    = process.env.EMAIL_PASS    || 'test-email-pass';
process.env.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
