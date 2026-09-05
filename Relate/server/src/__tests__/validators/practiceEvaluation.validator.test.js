'use strict';

import { describe, it, expect } from 'vitest';
import {
  validatePracticeEvaluation,
  ValidationError,
} from '../../services/ai/validators/practiceEvaluation.validator.js';

// ─── Helper ──────────────────────────────────────────────────────────────────

function validEvaluation(overrides = {}) {
  return {
    correct: true,
    feedback: 'Good answer!',
    correctAnswer: 'The sender acts as the post office.',
    explanation: 'The sender initiates all communication.',
    mappingLabel: 'Origin',
    encouragement: 'Keep it up!',
    misconception: null,
    ...overrides,
  };
}

// ─── Top-level shape ──────────────────────────────────────────────────────────

describe('validatePracticeEvaluation — top-level shape', () => {
  it('accepts a valid evaluation object and returns it', () => {
    const data = validEvaluation();
    expect(validatePracticeEvaluation(data)).toBe(data);
  });

  it('rejects null', () => {
    expect(() => validatePracticeEvaluation(null)).toThrow(ValidationError);
  });

  it('rejects an array', () => {
    expect(() => validatePracticeEvaluation([])).toThrow(ValidationError);
  });

  it('rejects a string', () => {
    expect(() => validatePracticeEvaluation('text')).toThrow(ValidationError);
  });

  it('rejects a number', () => {
    expect(() => validatePracticeEvaluation(42)).toThrow(ValidationError);
  });
});

// ─── correct field ────────────────────────────────────────────────────────────

describe('validatePracticeEvaluation — correct', () => {
  it('accepts correct: true', () => {
    expect(() => validatePracticeEvaluation(validEvaluation({ correct: true }))).not.toThrow();
  });

  it('accepts correct: false', () => {
    expect(() => validatePracticeEvaluation(validEvaluation({ correct: false }))).not.toThrow();
  });

  it('rejects correct: "true" (string)', () => {
    expect(() => validatePracticeEvaluation(validEvaluation({ correct: 'true' }))).toThrow(ValidationError);
  });

  it('rejects correct: 1 (number)', () => {
    expect(() => validatePracticeEvaluation(validEvaluation({ correct: 1 }))).toThrow(ValidationError);
  });

  it('rejects missing correct field', () => {
    const data = validEvaluation();
    delete data.correct;
    expect(() => validatePracticeEvaluation(data)).toThrow(ValidationError);
  });
});

// ─── Required string fields ───────────────────────────────────────────────────

const requiredStringFields = ['feedback', 'correctAnswer', 'explanation', 'mappingLabel', 'encouragement'];

for (const field of requiredStringFields) {
  describe(`validatePracticeEvaluation — ${field}`, () => {
    it(`rejects missing ${field}`, () => {
      const data = validEvaluation();
      delete data[field];
      expect(() => validatePracticeEvaluation(data)).toThrow(ValidationError);
    });

    it(`rejects empty string ${field}`, () => {
      expect(() => validatePracticeEvaluation(validEvaluation({ [field]: '' }))).toThrow(ValidationError);
    });

    it(`rejects whitespace-only ${field}`, () => {
      expect(() => validatePracticeEvaluation(validEvaluation({ [field]: '   ' }))).toThrow(ValidationError);
    });

    it(`rejects non-string ${field}`, () => {
      expect(() => validatePracticeEvaluation(validEvaluation({ [field]: 123 }))).toThrow(ValidationError);
    });
  });
}

// ─── misconception ────────────────────────────────────────────────────────────

describe('validatePracticeEvaluation — misconception', () => {
  it('accepts misconception: null', () => {
    expect(() => validatePracticeEvaluation(validEvaluation({ misconception: null }))).not.toThrow();
  });

  it('accepts misconception as a non-empty string', () => {
    expect(() =>
      validatePracticeEvaluation(validEvaluation({ misconception: 'User confused sender and receiver.' }))
    ).not.toThrow();
  });

  it('accepts misconception as an empty string', () => {
    // empty string is still a string — validator only checks type, not content for misconception
    expect(() => validatePracticeEvaluation(validEvaluation({ misconception: '' }))).not.toThrow();
  });

  it('rejects misconception as a number', () => {
    expect(() => validatePracticeEvaluation(validEvaluation({ misconception: 0 }))).toThrow(ValidationError);
  });

  it('rejects misconception as an object', () => {
    expect(() => validatePracticeEvaluation(validEvaluation({ misconception: {} }))).toThrow(ValidationError);
  });

  it('rejects misconception as a boolean', () => {
    expect(() => validatePracticeEvaluation(validEvaluation({ misconception: false }))).toThrow(ValidationError);
  });
});

// ─── ValidationError metadata ─────────────────────────────────────────────────

describe('ValidationError', () => {
  it('has name ValidationError', () => {
    try {
      validatePracticeEvaluation(null);
    } catch (err) {
      expect(err.name).toBe('ValidationError');
    }
  });

  it('has code VALIDATION_ERROR', () => {
    try {
      validatePracticeEvaluation(null);
    } catch (err) {
      expect(err.code).toBe('VALIDATION_ERROR');
    }
  });
});
