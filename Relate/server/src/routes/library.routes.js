'use strict';

const router = require('express').Router();

const libraryController = require('../controllers/library.controller');
const { requireAuth } = require('../middleware/auth.middleware');

// All library routes require authentication
router.use(requireAuth);

// ── GET /api/library ──────────────────────────────────────────────────────────
router.get('/', libraryController.getLibrary);

module.exports = router;
