'use strict';

/**
 * library.controller.js
 *
 * Handles library-related HTTP requests:
 *   GET /api/library — fetch all analogies for the authenticated user
 */

const Analogy = require('../models/Analogy.model');

// ─── GET /api/library ─────────────────────────────────────────────────────────

/**
 * Return all saved analogies for the authenticated user, ordered newest first.
 * Each item includes a previewNodes slice (first 4 nodes) for display.
 */
async function getLibrary(req, res) {
  try {
    const analogies = await Analogy.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      analogies: analogies.map(a => ({
        id: a._id,
        analogyTitle: a.analogyTitle,
        concept: a.concept,           // full text — frontend truncates for display
        analogyWorld: a.analogyWorld,
        createdAt: a.createdAt,
        previewNodes: (a.nodes || []).slice(0, 4).map(n => ({
          conceptLabel: n.conceptLabel,
          analogyLabel: n.analogyLabel
        }))
      }))
    });
  } catch (err) {
    console.error('[Library] DB error:', err.message);
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve library.' }
    });
  }
}

module.exports = { getLibrary };
