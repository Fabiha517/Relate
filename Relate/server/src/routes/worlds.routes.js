'use strict';

const express = require('express');
const ANALOGY_WORLD_LIST = require('../config/worlds');

const router = express.Router();

/**
 * GET /api/worlds
 * Returns the list of available analogy worlds.
 * No authentication required.
 * Requirements: 1.8
 */
router.get('/', (req, res) => {
  res.json({ worlds: ANALOGY_WORLD_LIST });
});

module.exports = router;
