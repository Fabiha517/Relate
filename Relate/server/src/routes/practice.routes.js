'use strict';

const router = require('express').Router();

const controller = require('../controllers/practice.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const {
  practiceQuestionsLimiter,
  practiceQuestionsMoreLimiter,
  practiceEvaluateLimiter
} = require('../middleware/rateLimiter');
const {
  validatePracticeQuestions,
  validatePracticeEvaluate,
  validateSavePracticeSession
} = require('../middleware/validate.middleware');

// â”€â”€ POST /api/practice/questions ─────────────────────────────────
router.post(
  '/questions',
  requireAuth,
  practiceQuestionsLimiter,
  validatePracticeQuestions,
  controller.generateQuestions
);

// â”€â”€ POST /api/practice/questions/more ─────────────────────────────────
router.post(
  '/questions/more',
  requireAuth,
  practiceQuestionsMoreLimiter,
  validatePracticeQuestions,
  controller.generateMoreQuestions
);

// â”€â”€ POST /api/practice/evaluate ─────────────────────────────────
router.post(
  '/evaluate',
  requireAuth,
  practiceEvaluateLimiter,
  validatePracticeEvaluate,
  controller.evaluate
);

//  ──  POST /api/practice/sessions ─────────────────────────────────
router.post(
  '/sessions',
  requireAuth,
  validateSavePracticeSession,
  controller.saveSession
);
// ── PATCH /api/practice/sessions/:sessionId ─────────────────────────────────

router.patch(
  '/sessions/:sessionId',
  requireAuth,  
  
  validateSavePracticeSession,
  controller.updateSession
);
//  ──  GET /api/practice/history ─────────────────────────────────
// Must be registered before /:analogyId to avoid path conflicts
router.get('/history', requireAuth, controller.getHistory);

//  ──  GET /api/practice/sessions/:analogyId ─────────────────────────────────
router.get('/sessions/:analogyId', requireAuth, controller.getSessionsForAnalogy);

//  ──  GET /api/practice/sessions/:analogyId/:sessionId ─────────────────────────────────
router.get('/sessions/:analogyId/:sessionId', requireAuth, controller.getSessionById);


// ── DELETE /api/practice/sessions/:sessionId ─────────────────────────────────
// Must be registered before /:analogyId/:sessionId to avoid conflicts
router.delete('/sessions/:sessionId', requireAuth, controller.deleteSession);
module.exports = router;

