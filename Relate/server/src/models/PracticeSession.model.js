'use strict';

const mongoose = require('mongoose');

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const practiceOptionSchema = new mongoose.Schema({
  text: { type: String },
  isCorrect: { type: Boolean }
}, { _id: false });

const practiceQuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ['multiple-choice', 'short-answer'], required: true },
  options: { type: [practiceOptionSchema], default: [] }, // only for multiple-choice
  expectedAnswer: { type: String, required: true },
  explanation: { type: String, required: true },
  mappingLabel: { type: String, required: true },
  encouragement: { type: String, required: true }
}, { _id: false });

const practiceAnswerSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  userAnswer: { type: String, required: true }
}, { _id: false });

const practiceEvaluationSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  correct: { type: Boolean, required: true },
  feedback: { type: String, required: true },
  correctAnswer: { type: String, required: true },
  explanation: { type: String, required: true },
  mappingLabel: { type: String, required: true },
  encouragement: { type: String, required: true },
  misconception: { type: String, default: null } // nullable
}, { _id: false });

// ── Main Model ────────────────────────────────────────────────────────────────
// CRITICAL: Sessions are NEVER overwritten — each practice attempt creates a new document.
// Use PracticeSession.create(), never findOneAndUpdate. (Requirement 12.3)

const practiceSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  analogyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Analogy',
    required: true
  },
  questions: {
    type: [practiceQuestionSchema],
    required: true
  },
  answers: {
    type: [practiceAnswerSchema],
    required: true
  },
  evaluations: {
    type: [practiceEvaluationSchema],
    required: true
  },
  // Math.round(correctCount / total * 100) — computed in usePractice hook
  score: {
    type: Number,
    required: true
  },
  misconceptions: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    required: true
  }
});

// Compound index for per-analogy session queries, ordered newest first
practiceSessionSchema.index({ userId: 1, analogyId: 1, completedAt: -1 });

// Additional index for PracticeHistoryPage (all sessions across all analogies)
practiceSessionSchema.index({ userId: 1, completedAt: -1 });

module.exports = mongoose.model('PracticeSession', practiceSessionSchema);
