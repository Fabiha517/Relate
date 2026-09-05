'use strict';

import { describe, it, expect } from 'vitest';
import {
  validatePracticeQuestions,
  ValidationError,
} from '../../services/ai/validators/practiceQuestions.validator.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function validMCQ(overrides = {}) {
  return {
    text: 'Which component acts as the post office?',
    type: 'multiple-choice',
    options: [
      { text: 'Sender',   isCorrect: true  },
      { text: 'Receiver', isCorrect: false },
      { text: 'Packet',   isCorrect: false },
    ],
    expectedAnswer: 'Sender',
    explanation: 'The sender initiates the communication.',
    mappingLabel: 'Origin',
    encouragement: 'Great job!',
    ...overrides,
  };
}

function validShortAnswer(overrides = {}) {
  return {
    text: 'What does the packet represent?',
    type: 'short-answer',
    expectedAnswer: 'The data payload',
    explanation: 'A packet encapsulates a chunk of data.',
    mappingLabel: 'Data',
    encouragement: 'Keep going!',
    ...overrides,
  };
}

// ─── Array-level checks ───────────────────────────────────────────────────────

describe('validatePracticeQuestions — array shape', () => {
  it('rejects non-array input', () => {
    expect(() => validatePracticeQuestions({})).toThrow(ValidationError);
    expect(() => validatePracticeQuestions('str')).toThrow(ValidationError);
    expect(() => validatePracticeQuestions(null)).toThrow(ValidationError);
  });

  it('rejects empty array (length < 1)', () => {
    expect(() => validatePracticeQuestions([])).toThrow(ValidationError);
  });

  it('rejects array with 6 items (length > 5)', () => {
    const questions = Array.from({ length: 6 }, () => validMCQ());
    expect(() => validatePracticeQuestions(questions)).toThrow(ValidationError);
  });

  it('accepts a single question (length = 1)', () => {
    expect(() => validatePracticeQuestions([validMCQ()])).not.toThrow();
  });

  it('accepts exactly 5 questions', () => {
    const questions = Array.from({ length: 5 }, () => validMCQ());
    expect(() => validatePracticeQuestions(questions)).not.toThrow();
  });

  it('returns the validated array', () => {
    const data = [validMCQ()];
    expect(validatePracticeQuestions(data)).toBe(data);
  });
});

// ─── Required question fields ─────────────────────────────────────────────────

describe('validatePracticeQuestions — required fields on each question', () => {
  it('rejects null question', () => {
    expect(() => validatePracticeQuestions([null])).toThrow(ValidationError);
  });

  it('rejects question with empty text', () => {
    expect(() => validatePracticeQuestions([validMCQ({ text: '' })])).toThrow(ValidationError);
  });

  it('rejects question with whitespace-only text', () => {
    expect(() => validatePracticeQuestions([validMCQ({ text: '   ' })])).toThrow(ValidationError);
  });

  it('rejects question with invalid type', () => {
    expect(() => validatePracticeQuestions([validMCQ({ type: 'essay' })])).toThrow(ValidationError);
  });

  it('accepts type "multiple-choice"', () => {
    expect(() => validatePracticeQuestions([validMCQ({ type: 'multiple-choice' })])).not.toThrow();
  });

  it('accepts type "short-answer"', () => {
    expect(() => validatePracticeQuestions([validShortAnswer()])).not.toThrow();
  });

  it('rejects empty expectedAnswer', () => {
    expect(() => validatePracticeQuestions([validMCQ({ expectedAnswer: '' })])).toThrow(ValidationError);
  });

  it('rejects empty explanation', () => {
    expect(() => validatePracticeQuestions([validMCQ({ explanation: '' })])).toThrow(ValidationError);
  });

  it('rejects empty mappingLabel', () => {
    expect(() => validatePracticeQuestions([validMCQ({ mappingLabel: '' })])).toThrow(ValidationError);
  });

  it('rejects whitespace-only mappingLabel', () => {
    expect(() => validatePracticeQuestions([validMCQ({ mappingLabel: '   ' })])).toThrow(ValidationError);
  });

  it('rejects non-string mappingLabel', () => {
    expect(() => validatePracticeQuestions([validMCQ({ mappingLabel: null })])).toThrow(ValidationError);
  });

  it('rejects empty encouragement', () => {
    expect(() => validatePracticeQuestions([validMCQ({ encouragement: '' })])).toThrow(ValidationError);
  });
});

// ─── MCQ-specific: options array ──────────────────────────────────────────────

describe('validatePracticeQuestions — MCQ options', () => {
  it('rejects MCQ with no options field', () => {
    const q = validMCQ();
    delete q.options;
    expect(() => validatePracticeQuestions([q])).toThrow(ValidationError);
  });

  it('rejects MCQ with only 1 option (< 2)', () => {
    const q = validMCQ({ options: [{ text: 'Only', isCorrect: true }] });
    expect(() => validatePracticeQuestions([q])).toThrow(ValidationError);
  });

  it('rejects MCQ with 7 options (> 6)', () => {
    const options = Array.from({ length: 7 }, (_, i) => ({
      text: `Option ${i}`,
      isCorrect: i === 0,
    }));
    expect(() => validatePracticeQuestions([validMCQ({ options })])).toThrow(ValidationError);
  });

  it('accepts MCQ with exactly 2 options', () => {
    const options = [
      { text: 'Yes', isCorrect: true },
      { text: 'No',  isCorrect: false },
    ];
    expect(() => validatePracticeQuestions([validMCQ({ options })])).not.toThrow();
  });

  it('accepts MCQ with exactly 6 options', () => {
    const options = Array.from({ length: 6 }, (_, i) => ({
      text: `Option ${i}`,
      isCorrect: i === 0,
    }));
    expect(() => validatePracticeQuestions([validMCQ({ options })])).not.toThrow();
  });

  it('rejects MCQ with 0 correct options', () => {
    const options = [
      { text: 'A', isCorrect: false },
      { text: 'B', isCorrect: false },
    ];
    expect(() => validatePracticeQuestions([validMCQ({ options })])).toThrow(ValidationError);
  });

  it('rejects MCQ with 2 correct options', () => {
    const options = [
      { text: 'A', isCorrect: true  },
      { text: 'B', isCorrect: true  },
      { text: 'C', isCorrect: false },
    ];
    expect(() => validatePracticeQuestions([validMCQ({ options })])).toThrow(ValidationError);
  });

  it('rejects an option with empty text', () => {
    const q = validMCQ();
    q.options[0].text = '';
    expect(() => validatePracticeQuestions([q])).toThrow(ValidationError);
  });

  it('rejects an option where isCorrect is not a boolean', () => {
    const q = validMCQ();
    q.options[0].isCorrect = 'yes';
    expect(() => validatePracticeQuestions([q])).toThrow(ValidationError);
  });

  it('rejects a null option object', () => {
    const q = validMCQ();
    q.options[0] = null;
    expect(() => validatePracticeQuestions([q])).toThrow(ValidationError);
  });

  // short-answer questions should NOT require options
  it('accepts short-answer question without options field', () => {
    const q = validShortAnswer();
    expect(q.options).toBeUndefined();
    expect(() => validatePracticeQuestions([q])).not.toThrow();
  });
});
