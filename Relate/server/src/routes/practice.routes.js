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

// â”€â”€ POST /api/practice/questions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.post(
  '/questions',
  requireAuth,
  practiceQuestionsLimiter,
  validatePracticeQuestions,
  controller.generateQuestions
);

// â”€â”€ POST /api/practice/questions/more â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.post(
  '/questions/more',
  requireAuth,
  practiceQuestionsMoreLimiter,
  validatePracticeQuestions,
  controller.generateMoreQuestions
);

// â”€â”€ POST /api/practice/evaluate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.post(
  '/evaluate',
  requireAuth,
  practiceEvaluateLimiter,
  validatePracticeEvaluate,
  controller.evaluate
);

// â”€â”€ POST /api/practice/sessions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.post(
  '/sessions',
  requireAuth,
  validateSavePracticeSession,
  controller.saveSession
);

// â”€â”€ GET /api/practice/history â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Must be registered before /:analogyId to avoid path conflicts
router.get('/history', requireAuth, controller.getHistory);

// â”€â”€ GET /api/practice/sessions/:analogyId â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.get('/sessions/:analogyId', requireAuth, controller.getSessionsForAnalogy);

// â”€â”€ GET /api/practice/sessions/:analogyId/:sessionId â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.get('/sessions/:analogyId/:sessionId', requireAuth, controller.getSessionById);


// ── DELETE /api/practice/sessions/:sessionId ─────────────────────────────────
// Must be registered before /:analogyId/:sessionId to avoid conflicts
router.delete('/sessions/:sessionId', requireAuth, controller.deleteSession);
module.exports = router;

