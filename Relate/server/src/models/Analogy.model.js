'use strict';

const mongoose = require('mongoose');

// ── Subdocuments ──────────────────────────────────────────────────────────────

const analogyNodeSchema = new mongoose.Schema({
  id: { type: String, required: true },           // stable identifier from AI_Response
  conceptLabel: { type: String, required: true }, // truncated to 60 chars at display
  analogyLabel: { type: String, required: true }  // truncated to 60 chars at display
}, { _id: false });

const analogyMappingSchema = new mongoose.Schema({
  conceptComponent: { type: String, required: true },
  analogyElement: { type: String, required: true },
  mappingLabel: { type: String, required: true }  // referenced by Practice questions
}, { _id: false });

const analogyRelationshipSchema = new mongoose.Schema({
  sourceId: { type: String, required: true },
  targetId: { type: String, required: true },
  label: { type: String },                         // optional edge label
  flow: { type: Boolean, default: false }          // true = directional arrow in Visual_Model
}, { _id: false });

// ── Main Model ────────────────────────────────────────────────────────────────

const analogySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Concept-focused title derived from the Concept — NEVER the Analogy_World name
  analogyTitle: {
    type: String,
    required: true
  },
  concept: {
    type: String,
    required: true,
    maxlength: 5000
  },
  analogyWorld: {
    type: String,
    required: true,
    maxlength: 100
  },
  nodes: {
    type: [analogyNodeSchema],
    required: true
  },
  mappings: {
    type: [analogyMappingSchema],
    required: true
  },
  relationships: {
    type: [analogyRelationshipSchema],
    required: true
  },
  explanation: {
    type: String,
    required: true
  },
  limitations: {
    type: [String],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook: keep updatedAt current
analogySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Node positions are NOT stored — computed at render time by Dagre (Requirement 3.11)

module.exports = mongoose.model('Analogy', analogySchema);
