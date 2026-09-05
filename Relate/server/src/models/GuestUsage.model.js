'use strict';

const mongoose = require('mongoose');

// Reuse the same subdocument shapes from Analogy for the stored analogyData
const analogyNodeSchema = new mongoose.Schema({
  id: { type: String },
  conceptLabel: { type: String },
  analogyLabel: { type: String }
}, { _id: false });

const analogyMappingSchema = new mongoose.Schema({
  conceptComponent: { type: String },
  analogyElement: { type: String },
  mappingLabel: { type: String }
}, { _id: false });

const analogyRelationshipSchema = new mongoose.Schema({
  sourceId: { type: String },
  targetId: { type: String },
  label: { type: String },
  flow: { type: Boolean }
}, { _id: false });

const guestUsageSchema = new mongoose.Schema({
  // Value of the Guest_ID cookie — identifies the unauthenticated visitor
  guestId: {
    type: String,
    required: true,
    index: true
  },
  // Whether the one free analogy-generation opportunity has been consumed
  consumed: {
    type: Boolean,
    required: true,
    default: false
  },
  // The generated analogy stored for potential transfer to an account (optional)
  analogyData: {
    analogyTitle: { type: String },
    concept: { type: String },
    analogyWorld: { type: String },
    nodes: { type: [analogyNodeSchema] },
    mappings: { type: [analogyMappingSchema] },
    relationships: { type: [analogyRelationshipSchema] },
    explanation: { type: String },
    limitations: { type: [String] }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // MongoDB TTL index auto-deletes documents 90 days after creation
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  }
});

// TTL index — MongoDB auto-removes expired guest records after 90 days
guestUsageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('GuestUsage', guestUsageSchema);
