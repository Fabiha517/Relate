'use strict';

/**
 * Integration tests for all six auth endpoints.
 *
 * Uses MongoDB Memory Server so no real MongoDB instance is required.
 * Uses Supertest to send real HTTP requests against the Express app.
 *
 * Vitest globals (describe, it, beforeAll, afterAll, afterEach, expect, vi)
 * are injected automatically because globals:true is set in vitest.config.js.
 *
 * Strategy for app.js mongoose.connect():
 *   app.js calls mongoose.connect() at module evaluation time.
 *   We mock it before importing app so it is a no-op, then manually
 *   connect mongoose to the memory server in beforeAll.
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');

// ── Stub mongoose.connect BEFORE app.js is required ──────────────────────────
// This prevents the real URI from being used and avoids process.exit(1) on
// connection failure when the placeholder URI in setup.js is not reachable.
vi.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);

// Now safe to require app (mongoose.connect is a no-op stub).
const app = require('../../app.js');

// ── Models & services needed for DB assertions / manual fixture creation ──────
const User = require('../../models/User.model.js');
const ResetToken = require('../../models/ResetToken.model.js');
const tokenService = require('../../services/token.service.js');

// ── Memory server lifecycle ───────────────────────────────────────────────────
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  // Restore the real connect and use the memory server URI.
  vi.restoreAllMocks();
  await mongoose.connect(uri);
}, 60000);

afterEach(async () => {
  // Clear all collections between tests to keep tests isolated.
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// ── Shared test data ──────────────────────────────────────────────────────────
const VALID_USER = {
  name: 'Alice Test',
  email: 'alice@example.com',
  password: 'securePassword123'
};

/** Helper: register VALID_USER and return the supertest response. */
async function registerUser(overrides = {}) {
  return request(app)
    .post('/api/auth/register')
    .send({ ...VALID_USER, ...overrides });
}

/** Helper: register VALID_USER and then login, returning the login response. */
async function loginUser(overrides = {}) {
  await registerUser();
  return request(app)
    .post('/api/auth/login')
    .send({
      email: overrides.email ?? VALID_USER.email,
      password: overrides.password ?? VALID_USER.password
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  it('returns 201 and sets the auth cookie on valid registration', async () => {
    const res = await registerUser();

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toMatchObject({
      name: VALID_USER.name,
      email: VALID_USER.email
    });

    // Cookie header must contain the token cookie.
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    const cookieStr = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie;
    expect(cookieStr).toMatch(/token=/);
  });

  it('returns 400 VALIDATION_ERROR with email field on duplicate email', async () => {
    // Register once
    await registerUser();
    // Register again with same email
    const res = await registerUser();

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.fields.email).toBe(
      'An account with this email is already registered.'
    );
  });

  it('returns 400 VALIDATION_ERROR with password field when password is 7 chars', async () => {
    const res = await registerUser({ password: 'short7!' }); // exactly 7 chars

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.fields.password).toBe(
      'Password must be at least 8 characters.'
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  it('returns 200 and sets the auth cookie on valid credentials', async () => {
    const res = await loginUser();

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');

    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    const cookieStr = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie;
    expect(cookieStr).toMatch(/token=/);
  });

  it('returns 401 with generic message on wrong password', async () => {
    await registerUser();
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: VALID_USER.email, password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('AUTH_ERROR');
    expect(res.body.error.message).toBe('Invalid email or password.');
  });

  it('returns 401 with generic message on non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'somepassword' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('AUTH_ERROR');
    expect(res.body.error.message).toBe('Invalid email or password.');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/auth/me', () => {
  it('returns 200 with user profile when a valid cookie is provided', async () => {
    // Register to get a cookie.
    const registerRes = await registerUser();
    const setCookie = registerRes.headers['set-cookie'];

    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', setCookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toMatchObject({
      name: VALID_USER.name,
      email: VALID_USER.email
    });
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user).toHaveProperty('createdAt');
  });

  it('returns 401 when no cookie is provided', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('AUTH_ERROR');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/auth/forgot-password', () => {
  it('always returns 200 with safe message for a non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nobody@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      'If an account with that email exists, a reset link has been sent.'
    );
  });

  it('always returns 200 with safe message even for a registered email', async () => {
    await registerUser();
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: VALID_USER.email });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      'If an account with that email exists, a reset link has been sent.'
    );
  });

  it('creates a ResetToken document with tokenHash (not plaintext) for a registered email', async () => {
    // Register the user first so they exist in the DB.
    const registerRes = await registerUser();
    const userId = registerRes.body.user.id;

    // Trigger forgot-password.
    await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: VALID_USER.email });

    // The controller awaits ResetToken.create, so the record is present immediately.
    const resetToken = await ResetToken.findOne({ userId });

    expect(resetToken).not.toBeNull();

    // tokenHash must be a 64-char hex string (SHA-256 of 32 random bytes).
    expect(resetToken.tokenHash).toMatch(/^[0-9a-f]{64}$/);

    // Verify that no "plaintext" or "token" field with the raw value exists
    // on the document (the schema has no such field — just tokenHash).
    const doc = resetToken.toObject();
    expect(doc).not.toHaveProperty('token');
    expect(doc).not.toHaveProperty('plaintext');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/reset-password
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/auth/reset-password', () => {
  /**
   * Helper: register a user, then manually insert a ResetToken record using
   * a generated plaintext token. Returns { userId, plaintext, tokenHash }.
   */
  async function createResetTokenForUser(overrides = {}) {
    const registerRes = await registerUser();
    const userId = registerRes.body.user.id;

    const plaintext = tokenService.generateToken();
    const tokenHash = tokenService.hashToken(plaintext);
    const expiresAt = overrides.expiresAt ?? new Date(Date.now() + 60 * 60 * 1000);
    const used = overrides.used ?? false;

    await ResetToken.create({ userId, tokenHash, expiresAt, used });

    return { userId, plaintext, tokenHash };
  }

  it('returns 200 and updates the passwordHash + marks token used on valid token', async () => {
    const { userId, plaintext } = await createResetTokenForUser();

    // Capture password hash before reset.
    const userBefore = await User.findById(userId).select('passwordHash');
    const hashBefore = userBefore.passwordHash;

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: plaintext, newPassword: 'newSecurePass1' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Password reset successfully.');

    // Password hash must have changed.
    const userAfter = await User.findById(userId).select('passwordHash');
    expect(userAfter.passwordHash).not.toBe(hashBefore);

    // Token must be marked as used.
    const tokenRecord = await ResetToken.findOne({
      tokenHash: tokenService.hashToken(plaintext)
    });
    expect(tokenRecord.used).toBe(true);
  });

  it('returns 400 RESET_TOKEN_INVALID for an already-used token', async () => {
    const { plaintext } = await createResetTokenForUser({ used: true });

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: plaintext, newPassword: 'newSecurePass1' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('RESET_TOKEN_INVALID');
  });

  it('returns 400 RESET_TOKEN_INVALID for an expired token', async () => {
    // Set expiresAt to 1 hour in the past.
    const { plaintext } = await createResetTokenForUser({
      expiresAt: new Date(Date.now() - 60 * 60 * 1000)
    });

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: plaintext, newPassword: 'newSecurePass1' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('RESET_TOKEN_INVALID');
  });

  it('returns 400 RESET_TOKEN_INVALID for a completely unknown token', async () => {
    const fakeToken = tokenService.generateToken(); // never inserted into DB

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: fakeToken, newPassword: 'newSecurePass1' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('RESET_TOKEN_INVALID');
  });
});
