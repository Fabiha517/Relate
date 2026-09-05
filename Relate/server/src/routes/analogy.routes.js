'use strict';

const router = require('express').Router();

const controller = require('../controllers/analogy.controller');
const { requireAuth, optionalAuth } = require('../middleware/auth.middleware');
const { analogyGenerateLimiter } = require('../middleware/rateLimiter');
const {
  sanitize,
  validateGenerateAnalogy,
  validateSaveAnalogy,
  validateModifyAnalogy
} = require('../middleware/validate.middleware');

// ── POST /api/analogies/generate ─────────────────────────────────────────────
// Rate-limited by userId (authenticated) or IP (guest).
// Auth is optional — requireAuth is NOT applied so guests can access this route.
router.post( '/generate', analogyGenerateLimiter, optionalAuth, sanitize(['concept', 'analogyWorld']), validateGenerateAnalogy, controller.generate );  


// ── POST /api/analogies ───────────────────────────────────────────────────────
router.post(
  '/',
  requireAuth,
  sanitize(['concept', 'analogyWorld']),
  validateSaveAnalogy,
  controller.save
);

// ── GET /api/analogies/:id ────────────────────────────────────────────────────
router.get('/:id', requireAuth, controller.getById);

// ── PUT /api/analogies/:id ────────────────────────────────────────────────────
router.put('/:id', requireAuth, validateSaveAnalogy, controller.update);

// ── DELETE /api/analogies/:id ─────────────────────────────────────────────────
router.delete('/:id', requireAuth, controller.remove);

// ── POST /api/analogies/:id/modify ───────────────────────────────────────────
router.post('/:id/modify', requireAuth, validateModifyAnalogy, controller.modify);

module.exports = router;
