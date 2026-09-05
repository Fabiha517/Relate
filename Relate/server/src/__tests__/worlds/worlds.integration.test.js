'use strict';

/**
 * Integration tests for GET /api/worlds.
 *
 * Property 1: Analogy_World selector reflects backend API data exactly
 * Validates: Requirements 1.3, 1.8
 *
 * Follows the same pattern as auth.integration.test.js:
 *   - MongoDB Memory Server for DB lifecycle
 *   - mongoose.connect stubbed before app.js is required
 *   - Supertest for HTTP assertions
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');

// ── Stub mongoose.connect BEFORE app.js is required ──────────────────────────
vi.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);

const app = require('../../app.js');
const { ANALOGY_WORLD_LIST } = require('../../config/worlds.js');

// ── Memory server lifecycle ───────────────────────────────────────────────────
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  vi.restoreAllMocks();
  await mongoose.connect(uri);
}, 60000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/worlds
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/worlds', () => {
  it('returns 200 with { worlds: string[] }', async () => {
    const res = await request(app).get('/api/worlds');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('worlds');
    expect(Array.isArray(res.body.worlds)).toBe(true);
    res.body.worlds.forEach(w => expect(typeof w).toBe('string'));
  });

  it('worlds array exactly matches ANALOGY_WORLD_LIST from config (Property 1)', async () => {
    const res = await request(app).get('/api/worlds');

    expect(res.status).toBe(200);
    expect(res.body.worlds).toEqual(ANALOGY_WORLD_LIST);
  });

  it('worlds array is non-empty', async () => {
    const res = await request(app).get('/api/worlds');

    expect(res.status).toBe(200);
    expect(res.body.worlds.length).toBeGreaterThan(0);
  });

  it('works without any auth cookie — public endpoint', async () => {
    // Send request with no Cookie header at all.
    const res = await request(app).get('/api/worlds');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('worlds');
  });

  it('sets a guestId cookie because guest middleware runs globally before all routes', async () => {
    const res = await request(app).get('/api/worlds');

    expect(res.status).toBe(200);

    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();

    const cookieStr = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie;
    expect(cookieStr).toMatch(/guestId=/);
  });
});
