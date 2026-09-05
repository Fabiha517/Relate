'use strict';

/**
 * Integration tests for practice endpoints.
 *
 * Uses MongoDB Memory Server (no real DB required).
 * Uses Supertest for real HTTP requests against the Express app.
 * AI service is mocked via vi.spyOn() — no real LLM calls.
 *
 * Follows the same pattern as analogy.integration.test.js:
 *   - require() real modules into cache first
 *   - vi.spyOn() their exported functions
 *   - stub mongoose.connect before app is required
 *   - restore and use real in-memory connection in beforeAll
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');

// ── Load real AI module into require cache FIRST ──────────────────────────────
const aiService = require('../../services/ai/aiService');

// ── Stub mongoose.connect before app.js is required ──────────────────────────
vi.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);

// Now safe to require app
const app = require('../../app.js');

// ── Models ────────────────────────────────────────────────────────────────────
const User = require('../../models/User.model.js');
const Analogy = require('../../models/Analogy.model.js');
const PracticeSession = require('../../models/PracticeSession.model.js');

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

/** A valid practice question with mappingLabel matching validAnalogy.mappings */
const validQuestion = {
  text: 'What does the customer represent?',
  type: 'multiple-choice',
  options: [
    { text: 'The client', isCorrect: true },
    { text: 'The server', isCorrect: false }
  ],
  expectedAnswer: 'The client',
  explanation: 'The customer maps to the client in the analogy.',
  mappingLabel: 'Client-Customer',
  encouragement: 'Keep trying!'
};

const validEvaluation = {
  correct: true,
  feedback: 'Good answer!',
  correctAnswer: 'The client',
  explanation: 'The customer represents the client that makes requests.',
  mappingLabel: 'Client-Customer',
  encouragement: 'Well done!',
  misconception: null
};

/** Minimal valid session payload */
const makeSessionPayload = (analogyId) => ({
  analogyId,
  questions: [validQuestion],
  answers: [{ questionIndex: 0, userAnswer: 'The client' }],
  evaluations: [
    {
      questionIndex: 0,
      correct: true,
      feedback: 'Correct!',
      correctAnswer: 'The client',
      explanation: 'Good.',
      mappingLabel: 'Client-Customer',
      encouragement: 'Great job!',
      misconception: null
    }
  ],
  score: 100,
  completedAt: new Date().toISOString()
});

/** Register a user and return a signed JWT cookie. */
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
// POST /api/practice/questions
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/practice/questions', () => {
  it('returns 401 when no auth cookie is provided', async () => {
    const res = await request(app)
      .post('/api/practice/questions')
      .send({ analogyId: new mongoose.Types.ObjectId().toString() });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('AUTH_ERROR');
  });

  it('returns 200 { questions } when auth is valid and AI returns valid questions', async () => {
    const { cookie, userId } = await registerAndLogin();
    const analogy = await Analogy.create({ userId, ...validAnalogy });

    vi.spyOn(aiService, 'generatePracticeQuestions').mockResolvedValue([validQuestion]);

    const res = await request(app)
      .post('/api/practice/questions')
      .set('Cookie', cookie)
      .send({ analogyId: analogy._id.toString() });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('questions');
    expect(Array.isArray(res.body.questions)).toBe(true);
    expect(res.body.questions[0].mappingLabel).toBe('Client-Customer');
  });

  it('returns 403 FORBIDDEN when the analogy belongs to a different user', async () => {
    const { userId: ownerId } = await registerAndLogin({ email: 'owner@example.com' });
    const analogy = await Analogy.create({ userId: ownerId, ...validAnalogy });

    const { cookie: otherCookie } = await registerAndLogin({ email: 'other@example.com' });

    const res = await request(app)
      .post('/api/practice/questions')
      .set('Cookie', otherCookie)
      .send({ analogyId: analogy._id.toString() });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('returns 503 AI_FAILURE when AI consistently returns invalid mappingLabels', async () => {
    const { cookie, userId } = await registerAndLogin();
    const analogy = await Analogy.create({ userId, ...validAnalogy });

    // Return a question with a mappingLabel not in the analogy's stored mappings
    const badQuestion = { ...validQuestion, mappingLabel: 'NonExistentLabel' };
    vi.spyOn(aiService, 'generatePracticeQuestions').mockResolvedValue([badQuestion]);

    const res = await request(app)
      .post('/api/practice/questions')
      .set('Cookie', cookie)
      .send({ analogyId: analogy._id.toString() });

    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('AI_FAILURE');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/practice/evaluate
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/practice/evaluate', () => {
  it('returns 200 { evaluation } when auth is valid and AI returns a valid evaluation', async () => {
    const { cookie } = await registerAndLogin();

    vi.spyOn(aiService, 'evaluateAnswer').mockResolvedValue(validEvaluation);

    const res = await request(app)
      .post('/api/practice/evaluate')
      .set('Cookie', cookie)
      .send({ question: validQuestion, userAnswer: 'The client' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('evaluation');
    expect(res.body.evaluation.correct).toBe(true);
    expect(res.body.evaluation.feedback).toBe('Good answer!');
  });

  it('returns 401 when no auth cookie is provided', async () => {
    const res = await request(app)
      .post('/api/practice/evaluate')
      .send({ question: validQuestion, userAnswer: 'The client' });

    expect(res.status).toBe(401);
  });

  it('returns 503 AI_FAILURE when AI throws', async () => {
    const { cookie } = await registerAndLogin();

    const err = new Error('AI error');
    err.code = 'AI_FAILURE';
    vi.spyOn(aiService, 'evaluateAnswer').mockRejectedValue(err);

    const res = await request(app)
      .post('/api/practice/evaluate')
      .set('Cookie', cookie)
      .send({ question: validQuestion, userAnswer: 'wrong answer' });

    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('AI_FAILURE');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/practice/sessions
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/practice/sessions', () => {
  it('returns 201 { sessionId } and creates a new DB record', async () => {
    const { cookie, userId } = await registerAndLogin();
    const analogy = await Analogy.create({ userId, ...validAnalogy });

    const payload = makeSessionPayload(analogy._id.toString());

    const res = await request(app)
      .post('/api/practice/sessions')
      .set('Cookie', cookie)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('sessionId');

    // Verify the document was actually persisted in DB
    const doc = await PracticeSession.findById(res.body.sessionId);
    expect(doc).not.toBeNull();
    expect(doc.score).toBe(100);
  });

  it('creates a new distinct session for the same analogy — never overwrites', async () => {
    const { cookie, userId } = await registerAndLogin();
    const analogy = await Analogy.create({ userId, ...validAnalogy });
    const payload = makeSessionPayload(analogy._id.toString());

    const res1 = await request(app)
      .post('/api/practice/sessions')
      .set('Cookie', cookie)
      .send(payload);

    const res2 = await request(app)
      .post('/api/practice/sessions')
      .set('Cookie', cookie)
      .send(payload);

    expect(res1.status).toBe(201);
    expect(res2.status).toBe(201);
    // Both sessions must have distinct IDs
    expect(res1.body.sessionId).not.toBe(res2.body.sessionId);

    // Both should exist in DB
    const count = await PracticeSession.countDocuments({
      userId,
      analogyId: analogy._id
    });
    expect(count).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/practice/sessions/:analogyId
// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/practice/sessions/:analogyId', () => {
  it('returns sessions ordered newest first', async () => {
    const { cookie, userId } = await registerAndLogin();
    const analogy = await Analogy.create({ userId, ...validAnalogy });

    // Create two sessions with different completedAt times
    const earlier = new Date(Date.now() - 60000).toISOString();
    const later   = new Date().toISOString();

    await PracticeSession.create({
      userId, analogyId: analogy._id, questions: [validQuestion],
      answers: [], evaluations: [], score: 60,
      completedAt: new Date(earlier)
    });
    await PracticeSession.create({
      userId, analogyId: analogy._id, questions: [validQuestion],
      answers: [], evaluations: [], score: 80,
      completedAt: new Date(later)
    });

    const res = await request(app)
      .get(`/api/practice/sessions/${analogy._id}`)
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('sessions');
    expect(res.body.sessions).toHaveLength(2);

    // Newest first
    expect(new Date(res.body.sessions[0].completedAt).getTime())
      .toBeGreaterThan(new Date(res.body.sessions[1].completedAt).getTime());

    // Check summary shape
    const s = res.body.sessions[0];
    expect(s).toHaveProperty('sessionId');
    expect(s).toHaveProperty('analogyTitle');
    expect(s).toHaveProperty('analogyWorld');
    expect(s).toHaveProperty('completedAt');
    expect(s).toHaveProperty('score');
    expect(s).toHaveProperty('questionCount');
    expect(s).toHaveProperty('weakAreaCount');
    expect(s.analogyTitle).toBe('APIs');
    expect(s.analogyWorld).toBe('Restaurant');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/practice/sessions/:analogyId/:sessionId
// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/practice/sessions/:analogyId/:sessionId', () => {
  it('returns 200 { session } with full document for the owner', async () => {
    const { cookie, userId } = await registerAndLogin();
    const analogy = await Analogy.create({ userId, ...validAnalogy });
    const session = await PracticeSession.create({
      userId, analogyId: analogy._id, questions: [validQuestion],
      answers: [], evaluations: [], score: 75,
      completedAt: new Date()
    });

    const res = await request(app)
      .get(`/api/practice/sessions/${analogy._id}/${session._id}`)
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('session');
    expect(res.body.session.score).toBe(75);
    expect(Array.isArray(res.body.session.questions)).toBe(true);
  });

  it('returns 403 FORBIDDEN for a non-owner', async () => {
    const { userId: ownerId } = await registerAndLogin({ email: 'sess-owner@example.com' });
    const analogy = await Analogy.create({ userId: ownerId, ...validAnalogy });
    const session = await PracticeSession.create({
      userId: ownerId, analogyId: analogy._id, questions: [validQuestion],
      answers: [], evaluations: [], score: 75,
      completedAt: new Date()
    });

    const { cookie: otherCookie } = await registerAndLogin({ email: 'sess-other@example.com' });

    const res = await request(app)
      .get(`/api/practice/sessions/${analogy._id}/${session._id}`)
      .set('Cookie', otherCookie);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/practice/questions/more  — previousQuestions forwarded to AI
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/practice/questions/more', () => {
  it('calls generatePracticeQuestions with a previousQuestions array', async () => {
    const { cookie, userId } = await registerAndLogin();
    const analogy = await Analogy.create({ userId, ...validAnalogy });

    const spy = vi.spyOn(aiService, 'generatePracticeQuestions').mockResolvedValue([validQuestion]);

    const previousQuestions = ['What does the customer represent?'];

    const res = await request(app)
      .post('/api/practice/questions/more')
      .set('Cookie', cookie)
      .send({
        analogyId: analogy._id.toString(),
        previousQuestions
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('questions');

    // Verify the spy was called with previousQuestions
    expect(spy).toHaveBeenCalledTimes(1);
    const callArg = spy.mock.calls[0][0];
    expect(Array.isArray(callArg.previousQuestions)).toBe(true);
    expect(callArg.previousQuestions).toEqual(previousQuestions);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/practice/history
// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/practice/history', () => {
  it('returns 401 when no auth cookie is provided', async () => {
    const res = await request(app).get('/api/practice/history');
    expect(res.status).toBe(401);
  });

  it('returns 200 with all sessions for the user, newest first', async () => {
    const { cookie, userId } = await registerAndLogin();
    const analogy = await Analogy.create({ userId, ...validAnalogy });

    // Create sessions at different times
    const t1 = new Date(Date.now() - 120000);
    const t2 = new Date(Date.now() - 60000);
    const t3 = new Date();

    await PracticeSession.create({
      userId, analogyId: analogy._id, questions: [validQuestion],
      answers: [], evaluations: [], score: 40, completedAt: t1
    });
    await PracticeSession.create({
      userId, analogyId: analogy._id, questions: [validQuestion],
      answers: [], evaluations: [], score: 60, completedAt: t2
    });
    await PracticeSession.create({
      userId, analogyId: analogy._id, questions: [validQuestion],
      answers: [], evaluations: [], score: 80, completedAt: t3
    });

    const res = await request(app)
      .get('/api/practice/history')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('sessions');
    expect(res.body.sessions).toHaveLength(3);

    // Newest first
    const times = res.body.sessions.map(s => new Date(s.completedAt).getTime());
    expect(times[0]).toBeGreaterThan(times[1]);
    expect(times[1]).toBeGreaterThan(times[2]);

    // Summary shape — no per-question detail at top level
    const s = res.body.sessions[0];
    expect(s).toHaveProperty('sessionId');
    expect(s).toHaveProperty('analogyTitle');
    expect(s).toHaveProperty('analogyWorld');
    expect(s).toHaveProperty('score');
    expect(s).toHaveProperty('questionCount');
    expect(s).toHaveProperty('weakAreaCount');
    // Should NOT expose individual questions array directly in summary
    expect(s).not.toHaveProperty('questions');
    expect(s).not.toHaveProperty('answers');
    expect(s).not.toHaveProperty('evaluations');
  });

  it('does not return sessions belonging to other users', async () => {
    const { cookie, userId } = await registerAndLogin({ email: 'histuser@example.com' });
    const { userId: otherId } = await registerAndLogin({ email: 'histother@example.com' });

    const analogy1 = await Analogy.create({ userId, ...validAnalogy });
    const analogy2 = await Analogy.create({ userId: otherId, ...validAnalogy });

    // One session for our user, one for the other
    await PracticeSession.create({
      userId,    analogyId: analogy1._id, questions: [validQuestion],
      answers: [], evaluations: [], score: 70, completedAt: new Date()
    });
    await PracticeSession.create({
      userId: otherId, analogyId: analogy2._id, questions: [validQuestion],
      answers: [], evaluations: [], score: 90, completedAt: new Date()
    });

    const res = await request(app)
      .get('/api/practice/history')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    // Should only see the one session belonging to our user
    expect(res.body.sessions).toHaveLength(1);
    expect(res.body.sessions[0].score).toBe(70);
  });
});
