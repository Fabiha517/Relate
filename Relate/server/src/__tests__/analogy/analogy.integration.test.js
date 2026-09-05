'use strict';

/**
 * Integration tests for analogy endpoints.
 *
 * Uses MongoDB Memory Server (no real DB required).
 * Uses Supertest for real HTTP requests against the Express app.
 * AI service and meaningfulness validator are mocked — no real LLM calls.
 *
 * Mocking strategy (CJS):
 *   This project uses CJS require() throughout. vi.mock() factories do not
 *   intercept CJS require() cache hits reliably. Instead we:
 *     1. require() the real modules (which loads them into the require cache)
 *     2. vi.spyOn() the specific functions on those real module objects
 *   The controller's require() will return the same cached object with our
 *   spies in place — exactly what the existing aiService.test.js does.
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');

// ── Load the real AI modules into the require cache FIRST ─────────────────────
// The controller will require() these same objects. We'll spy on them below.
const aiService = require('../../services/ai/aiService');
const meaningfulnessValidator = require('../../services/ai/meaningfulnessValidator');

// ── Stub mongoose.connect before app.js is required ──────────────────────────
vi.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);

// Now safe to require app
const app = require('../../app.js');

// ── Models needed for DB setup / assertions ───────────────────────────────────
const User = require('../../models/User.model.js');
const Analogy = require('../../models/Analogy.model.js');
const GuestUsage = require('../../models/GuestUsage.model.js');

// ── Memory server lifecycle ───────────────────────────────────────────────────
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  vi.restoreAllMocks(); // restore mongoose.connect spy
  await mongoose.connect(uri);
}, 60000);

afterEach(async () => {
  // Clear all collections between tests
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
  // Reset all spies
  vi.clearAllMocks();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// ── Shared fixtures ───────────────────────────────────────────────────────────

const validAnalogy = {
  analogyTitle: 'APIs',
  concept: 'How APIs work',
  analogyWorld: 'Restaurant',
  nodes: [
    { id: 'node_1', conceptLabel: 'Client', analogyLabel: 'Customer' },
    { id: 'node_2', conceptLabel: 'API', analogyLabel: 'Waiter' },
    { id: 'node_3', conceptLabel: 'Server', analogyLabel: 'Kitchen' }
  ],
  mappings: [
    { conceptComponent: 'Client', analogyElement: 'Customer', mappingLabel: 'Client-Customer' }
  ],
  relationships: [
    { sourceId: 'node_1', targetId: 'node_2', label: 'sends request', flow: true },
    { sourceId: 'node_2', targetId: 'node_3', label: 'forwards order', flow: true }
  ],
  explanation: 'APIs work like a restaurant where the customer orders food.',
  limitations: ['The analogy does not cover authentication.']
};

const validMeaningfulness = { valid: true, reason: 'ok', message: '' };

/** Register a user in DB and return a signed JWT cookie string. */
async function registerAndLogin(userData = {}) {
  const bcrypt = require('bcryptjs');
  const passwordHash = await bcrypt.hash('securePassword123', 12);
  const user = await User.create({
    name: userData.name ?? 'Test User',
    email: userData.email ?? 'test@example.com',
    passwordHash
  });

  const jwt = require('jsonwebtoken');
  const config = require('../../config/env');
  const token = jwt.sign(
    { userId: user._id.toString(), email: user.email },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  return { cookie: `token=${token}`, userId: user._id.toString(), user };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/analogies/generate
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/analogies/generate', () => {
  it('sets guestId cookie and returns 200 { analogy } when no guestId cookie is present', async () => {
    // Arrange — spy on the real module objects that the controller requires
    vi.spyOn(meaningfulnessValidator, 'validate').mockResolvedValue(validMeaningfulness);
    vi.spyOn(aiService, 'generate').mockResolvedValue(validAnalogy);

    // Act — send no Cookie header
    const res = await request(app)
      .post('/api/analogies/generate')
      .send({ concept: 'How APIs work', analogyWorld: 'Restaurant' });

    // Assert response
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('analogy');
    expect(res.body.analogy.analogyTitle).toBe('APIs');

    // Assert guestId cookie was set
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    const cookieStr = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie;
    expect(cookieStr).toMatch(/guestId=/);
  });

  it('returns 403 GUEST_LIMIT_REACHED when guestId cookie has consumed: true in DB', async () => {
    // Arrange
    vi.spyOn(meaningfulnessValidator, 'validate').mockResolvedValue(validMeaningfulness);
    vi.spyOn(aiService, 'generate').mockResolvedValue(validAnalogy);

    const guestId = 'consumed-guest-id-abc123';
    await GuestUsage.create({ guestId, consumed: true });

    // Act
    const res = await request(app)
      .post('/api/analogies/generate')
      .set('Cookie', `guestId=${guestId}`)
      .send({ concept: 'How APIs work', analogyWorld: 'Restaurant' });

    // Assert
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('GUEST_LIMIT_REACHED');
    // Must NOT include the analogy in the response
    expect(res.body).not.toHaveProperty('analogy');
  });

  it('returns 400 MEANINGFULNESS_REJECTED when concept is not meaningful', async () => {
    // Arrange
    vi.spyOn(meaningfulnessValidator, 'validate').mockResolvedValue({
      valid: false,
      reason: 'gibberish',
      message: 'Please provide a meaningful concept.'
    });
    const generateSpy = vi.spyOn(aiService, 'generate');

    // Act
    const res = await request(app)
      .post('/api/analogies/generate')
      .send({ concept: 'asdfghjkl', analogyWorld: 'Restaurant' });

    // Assert
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('MEANINGFULNESS_REJECTED');
    expect(res.body.error.message).toBe('Please provide a meaningful concept.');

    // AI service must NOT have been called
    expect(generateSpy).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/analogies — Save analogy (auth required)
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/analogies', () => {
  it('returns 201 { analogy: { id, analogyTitle, concept, analogyWorld, createdAt } } on valid save', async () => {
    const { cookie } = await registerAndLogin();

    const res = await request(app)
      .post('/api/analogies')
      .set('Cookie', cookie)
      .send(validAnalogy);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('analogy');
    const { analogy } = res.body;
    expect(analogy).toHaveProperty('id');
    expect(analogy.analogyTitle).toBe('APIs');
    expect(analogy.concept).toBe('How APIs work');
    expect(analogy.analogyWorld).toBe('Restaurant');
    expect(analogy).toHaveProperty('createdAt');
  });

  it('returns 401 when no cookie is provided', async () => {
    const res = await request(app)
      .post('/api/analogies')
      .send(validAnalogy);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('AUTH_ERROR');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analogies/:id
// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/analogies/:id', () => {
  it('returns 200 { analogy } for the owning user', async () => {
    const { cookie, userId } = await registerAndLogin();
    const doc = await Analogy.create({ userId, ...validAnalogy });

    const res = await request(app)
      .get(`/api/analogies/${doc._id}`)
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('analogy');
    expect(res.body.analogy.analogyTitle).toBe('APIs');
  });

  it('returns 403 FORBIDDEN for a non-owner', async () => {
    const { userId: ownerId } = await registerAndLogin({ email: 'owner@example.com' });
    const doc = await Analogy.create({ userId: ownerId, ...validAnalogy });

    const { cookie: otherCookie } = await registerAndLogin({ email: 'other@example.com' });

    const res = await request(app)
      .get(`/api/analogies/${doc._id}`)
      .set('Cookie', otherCookie);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('returns 500 INTERNAL_ERROR when stored doc fails validateAIResponse', async () => {
    const { cookie, userId } = await registerAndLogin();

    // Insert a valid doc, then corrupt the data via the native MongoDB driver
    // to bypass Mongoose schema validation (schema requires analogyTitle).
    const doc = await Analogy.create({ userId, ...validAnalogy });

    await mongoose.connection
      .collection('analogies')
      .updateOne({ _id: doc._id }, { $set: { analogyTitle: '' } });

    const res = await request(app)
      .get(`/api/analogies/${doc._id}`)
      .set('Cookie', cookie);

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/analogies/:id
// ─────────────────────────────────────────────────────────────────────────────

describe('PUT /api/analogies/:id', () => {
  it('returns 200 and verifies updatedAt was updated', async () => {
    const { cookie, userId } = await registerAndLogin();
    const doc = await Analogy.create({ userId, ...validAnalogy });
    const originalUpdatedAt = doc.updatedAt;

    // Brief delay to ensure the timestamp can differ
    await new Promise(r => setTimeout(r, 10));

    const updatedFields = {
      ...validAnalogy,
      analogyTitle: 'APIs v2',
      nodes: [
        { id: 'node_1', conceptLabel: 'Client Updated', analogyLabel: 'Guest' },
        { id: 'node_2', conceptLabel: 'API Updated', analogyLabel: 'Host' },
        { id: 'node_3', conceptLabel: 'Server Updated', analogyLabel: 'Venue' }
      ]
    };

    const res = await request(app)
      .put(`/api/analogies/${doc._id}`)
      .set('Cookie', cookie)
      .send(updatedFields);

    expect(res.status).toBe(200);
    expect(res.body.analogy.analogyTitle).toBe('APIs v2');

    const newUpdatedAt = new Date(res.body.analogy.updatedAt);
    expect(newUpdatedAt.getTime()).toBeGreaterThan(new Date(originalUpdatedAt).getTime());
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/analogies/:id
// ─────────────────────────────────────────────────────────────────────────────

describe('DELETE /api/analogies/:id', () => {
  it('returns 200 { message: "Analogy deleted." } for the owner', async () => {
    const { cookie, userId } = await registerAndLogin();
    const doc = await Analogy.create({ userId, ...validAnalogy });

    const res = await request(app)
      .delete(`/api/analogies/${doc._id}`)
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Analogy deleted.');

    const deleted = await Analogy.findById(doc._id);
    expect(deleted).toBeNull();
  });

  it('returns 403 FORBIDDEN for a non-owner', async () => {
    const { userId: ownerId } = await registerAndLogin({ email: 'owner2@example.com' });
    const doc = await Analogy.create({ userId: ownerId, ...validAnalogy });

    const { cookie: otherCookie } = await registerAndLogin({ email: 'other2@example.com' });

    const res = await request(app)
      .delete(`/api/analogies/${doc._id}`)
      .set('Cookie', otherCookie);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/analogies/:id/modify
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/analogies/:id/modify', () => {
  it('returns 200 { analogy } with mocked AI result', async () => {
    const { cookie, userId } = await registerAndLogin();
    const doc = await Analogy.create({ userId, ...validAnalogy });

    const modifiedAnalogy = { ...validAnalogy, analogyTitle: 'APIs Simplified' };
    vi.spyOn(aiService, 'generate').mockResolvedValue(modifiedAnalogy);

    const res = await request(app)
      .post(`/api/analogies/${doc._id}/modify`)
      .set('Cookie', cookie)
      .send({ modificationType: 'simplify' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('analogy');
    expect(res.body.analogy.analogyTitle).toBe('APIs Simplified');
  });
});
