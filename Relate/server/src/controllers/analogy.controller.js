'use strict';

/**
 * analogy.controller.js
 *
 * Handles all analogy-related HTTP requests:
 *   POST   /api/analogies/generate     — generate analogy (guest or auth)
 *   POST   /api/analogies              — save analogy (auth)
 *   GET    /api/analogies/:id          — get analogy (auth + ownership)
 *   PUT    /api/analogies/:id          — update analogy (auth + ownership)
 *   DELETE /api/analogies/:id          — delete analogy (auth + ownership)
 *   POST   /api/analogies/:id/modify   — modify analogy (auth + ownership)
 */

const Analogy = require('../models/Analogy.model');
const GuestUsage = require('../models/GuestUsage.model');
const aiService = require('../services/ai/aiService');
const meaningfulnessValidator = require('../services/ai/meaningfulnessValidator');
const { validateAIResponse } = require('../services/ai/validators/aiResponse.validator');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Sanitize guestAnalogy object before validation.
 * Removes HTML tags and MongoDB injection patterns ($, . in key positions).
 *
 * @param {object} obj - The object to sanitize
 * @returns {object} - Sanitized copy of the object
 */
function sanitizeGuestAnalogy(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  // Helper to remove HTML tags while preserving punctuation
  function stripHtmlTags(str) {
    if (typeof str !== 'string') return str;
    // Remove HTML tags but preserve content and punctuation
    return str.replace(/<[^>]*>/g, '');
  }

  // Recursively sanitize object keys and values
  function sanitizeRecursive(val) {
    if (val === null || val === undefined) return val;
    if (typeof val !== 'object') {
      if (typeof val === 'string') return stripHtmlTags(val);
      return val;
    }
    if (Array.isArray(val)) {
      return val.map(item => sanitizeRecursive(item));
    }
    const sanitized = {};
    for (const key of Object.keys(val)) {
      // Reject keys with MongoDB operator patterns ($ at start, . anywhere in key)
      if (key.startsWith('$') || key.includes('.')) {
        // Skip injection-suspicious keys
        continue;
      }
      sanitized[key] = sanitizeRecursive(val[key]);
    }
    return sanitized;
  }

  return sanitizeRecursive(obj);
}

/**
 * Perform round-trip JSON serialization validation.
 * Serializes object to JSON, parses it back, and re-validates against AI_Response schema.
 * Ensures analogyTitle and all fields survive the round-trip exactly.
 *
 * @param {object} obj - The object to validate
 * @returns {boolean} - True if round-trip validation passes
 * @throws - Throws if validateAIResponse fails
 */
function roundTripValidate(obj) {
  // Serialize and deserialize
  const serialized = JSON.stringify(obj);
  const deserialized = JSON.parse(serialized);

  // Re-validate the deserialized object
  validateAIResponse(deserialized);

  // Verify analogyTitle survived (key requirement)
  if (deserialized.analogyTitle !== obj.analogyTitle) {
    throw new Error('analogyTitle did not survive JSON round-trip');
  }

  return true;
}

function notFound(res) {
  return res.status(404).json({
    error: { code: 'NOT_FOUND', message: 'Analogy not found.' }
  });
}

function forbidden(res) {
  return res.status(403).json({
    error: { code: 'FORBIDDEN', message: 'Access denied.' }
  });
}

// ─── POST /api/analogies/generate ────────────────────────────────────────────

/**
 * Generate an analogy.
 *
 * Flow:
 *   1. Rate limiter (applied in route)
 *   2. Sanitize + validate (applied in route)
 *   3. Meaningfulness check — 400 MEANINGFULNESS_REJECTED if invalid
 *   4. AI generation — 503 AI_FAILURE if all retries exhausted
 *   5a. Unauthenticated: enforce guest single-use limit via GuestUsage
 *   5b. Authenticated: return analogy directly
 */
async function generate(req, res) {

  const { concept, analogyWorld } = req.body;

  // ── Step 3: Meaningfulness check ──────────────────────────────────────────
  let meaningResult;
  try {
    meaningResult = await meaningfulnessValidator.validate(concept);
  } catch {
    // Treat validator failure as AI failure — do not consume guest slot
    return res.status(503).json({
      error: {
        code: 'AI_FAILURE',
        message: 'Analogy generation failed. Please try again.'
      }
    });
  }

  if (!meaningResult.valid) {
    return res.status(400).json({
      error: {
        code: 'MEANINGFULNESS_REJECTED',
        message: meaningResult.message
      }
    });
  }

  // ── Step 4: AI generation ─────────────────────────────────────────────────
  let analogy;
  try {
    analogy = await aiService.generate({ concept, analogyWorld });
  } catch (err) {
    if (err.code === 'AI_FAILURE') {
      return res.status(503).json({
        error: {
          code: 'AI_FAILURE',
          message: 'Analogy generation failed. Please try again.'
        }
      });
    }
    // Unexpected error — still return 503
    return res.status(503).json({
      error: {
        code: 'AI_FAILURE',
        message: 'Analogy generation failed. Please try again.'
      }
    });
  }

  // ── Step 5: Guest enforcement (unauthenticated only) ──────────────────────
  if (!req.user) {
    const guestId = req.cookies?.guestId;

    // Check current consumption state
    const existing = await GuestUsage.findOne({ guestId });

    if (existing && existing.consumed) {
      // Already used — discard the generated analogy, do NOT return it
      return res.status(403).json({
        error: {
          code: 'GUEST_LIMIT_REACHED',
          message: 'You have used your free analogy. Create an account to generate more.'
        }
      });
    }

    // Atomically mark as consumed and store the analogy data
    await GuestUsage.findOneAndUpdate(
      { guestId },
      { $set: { consumed: true, analogyData: analogy } },
      { upsert: true, new: true }
    );

    return res.status(200).json({ analogy });
  }

  // ── Step 6: Authenticated — return directly ───────────────────────────────
  return res.status(200).json({ analogy });
}

// ─── POST /api/analogies ─────────────────────────────────────────────────────

/**
 * Save a new analogy for the authenticated user.
 */
async function save(req, res) {
  const {
    analogyTitle,
    concept,
    analogyWorld,
    nodes,
    mappings,
    relationships,
    explanation,
    limitations
  } = req.body;

  const doc = await Analogy.create({
    userId: req.user.userId,
    analogyTitle,
    concept,
    analogyWorld,
    nodes,
    mappings,
    relationships,
    explanation,
    limitations
  });

  // Round-trip validation: retrieve, deserialize, re-validate
  try {
    roundTripValidate(doc.toObject());
  } catch (err) {
    console.error('[analogy.controller] save round-trip validation error:', err.message);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Analogy data validation failed after storage.'
      }
    });
  }

  return res.status(201).json({
    analogy: {
      id: doc._id,
      analogyTitle: doc.analogyTitle,
      concept: doc.concept,
      analogyWorld: doc.analogyWorld,
      createdAt: doc.createdAt
    }
  });
}

// ─── GET /api/analogies/:id ───────────────────────────────────────────────────

/**
 * Retrieve a single analogy by ID.
 * Validates ownership and re-runs validateAIResponse on the stored data.
 */
async function getById(req, res) {
  const doc = await Analogy.findById(req.params.id).catch(() => null);
  if (!doc) return notFound(res);

  if (!doc.userId.equals(req.user.userId)) return forbidden(res);

  // Re-validate the stored data against the AI_Response schema
  try {
    validateAIResponse(doc.toObject());
  } catch {
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Stored analogy data is invalid.'
      }
    });
  }

  return res.status(200).json({ analogy: doc.toObject() });
}

// ─── PUT /api/analogies/:id ───────────────────────────────────────────────────

/**
 * Overwrite an existing analogy's content fields.
 */
async function update(req, res) {
  const doc = await Analogy.findById(req.params.id).catch(() => null);
  if (!doc) return notFound(res);

  if (!doc.userId.equals(req.user.userId)) return forbidden(res);

  const { analogyTitle, nodes, mappings, relationships, explanation, limitations } = req.body;

  doc.analogyTitle = analogyTitle;
  doc.nodes = nodes;
  doc.mappings = mappings;
  doc.relationships = relationships;
  doc.explanation = explanation;
  doc.limitations = limitations;
  doc.updatedAt = new Date();

  await doc.save();

  // Round-trip validation: serialize, deserialize, re-validate
  try {
    roundTripValidate(doc.toObject());
  } catch (err) {
    console.error('[analogy.controller] update round-trip validation error:', err.message);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Analogy data validation failed after storage.'
      }
    });
  }

  return res.status(200).json({
    analogy: {
      id: doc._id,
      analogyTitle: doc.analogyTitle,
      updatedAt: doc.updatedAt
    }
  });
}

// ─── DELETE /api/analogies/:id ────────────────────────────────────────────────

/**
 * Delete an analogy document.
 */
async function remove(req, res) {
  const doc = await Analogy.findById(req.params.id).catch(() => null);
  if (!doc) return notFound(res);

  if (!doc.userId.equals(req.user.userId)) return forbidden(res);

  await doc.deleteOne();

  return res.status(200).json({ message: 'Analogy deleted.' });
}

// ─── POST /api/analogies/:id/modify ──────────────────────────────────────────

/**
 * Apply a modification to an existing analogy via AI.
 *
 * modificationType values: 'simplify' | 'expand' | 'regenerate' | 'switchWorld'
 * previousAnalogyWorld for switchWorld always comes from the stored document.
 */
async function modify(req, res) {
  const doc = await Analogy.findById(req.params.id).catch(() => null);
  if (!doc) return notFound(res);

  if (!doc.userId.equals(req.user.userId)) return forbidden(res);

  const { modificationType, analogyWorld: newWorld } = req.body;

  let aiRequest;

  switch (modificationType) {
    case 'simplify':
    case 'expand':
      aiRequest = {
        concept: doc.concept,
        analogyWorld: doc.analogyWorld,
        modificationType,
        currentNodeCount: doc.nodes.length,
        currentAnalogyJson: JSON.stringify(doc.toObject()),
        analogyTitle: doc.analogyTitle
      };
      break;

    case 'regenerate':
      aiRequest = {
        concept: doc.concept,
        analogyWorld: doc.analogyWorld,
        modificationType,
        currentNodeCount: doc.nodes.length,
        currentAnalogyJson: JSON.stringify(doc.toObject()),
        analogyTitle: doc.analogyTitle,
        previousNodeLabels: doc.nodes.map(n => n.analogyLabel)
      };
      break;

    case 'switchWorld':
      aiRequest = {
        concept: doc.concept,
        analogyWorld: newWorld,                  // new world from request body
        modificationType: 'switchWorld',
        previousAnalogyWorld: doc.analogyWorld,   // always from stored document
        currentAnalogyJson: JSON.stringify(doc.toObject())
      };
      break;

    default:
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid modificationType.' }
      });
  }

let result;

try {
  console.log('=== MODIFY AI REQUEST ===');
  console.log(JSON.stringify(aiRequest, null, 2));

  result = await aiService.generate(aiRequest);

  console.log('=== MODIFY AI RESULT ===');
  console.log(JSON.stringify(result, null, 2));
} catch (err) {
  console.error('=== MODIFY AI ERROR ===');
  console.error('name:', err.name);
  console.error('code:', err.code);
  console.error('message:', err.message);
  console.error('stack:', err.stack);

  return res.status(503).json({
    error: {
      code: 'AI_FAILURE',
      message: 'Analogy generation failed. Please try again.'
    }
  });
}

  return res.status(200).json({ analogy: result });
}

module.exports = { 
  generate, 
  save, 
  getById, 
  update, 
  remove, 
  modify,
  sanitizeGuestAnalogy,
  roundTripValidate
};
