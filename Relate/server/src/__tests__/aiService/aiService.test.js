'use strict';

/**
 * Unit tests for aiService.js retry logic.
 *
 * Mocking strategy — why vi.spyOn instead of vi.mock():
 *
 *   aiService.js uses CJS require() throughout. When providers/index.js calls
 *   require('./oxalpha.provider') inside getProvider(), Node returns the same
 *   cached module object on every call. vi.mock() operates on Vitest's ESM
 *   module registry and does NOT intercept CJS require() cache hits.
 *
 *   The correct approach: require the REAL groq provider module here so we
 *   hold the same cached object that getProvider() will return. Then
 *   vi.spyOn(groqProvider, 'call') mutates that object's `call` property
 *   in place. Since getProvider() returns the same object, aiService's
 *   callWithRetry() will invoke our spy, not the real HTTP client.
 *
 *   No production files are changed.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRequire } from 'module';

// createRequire lets us pull a CJS module into an ESM test file and get
// the SAME cached object that all other CJS modules will see.
const require = createRequire(import.meta.url);

// -- Grab the real cached groq provider module ---------------------------------------
const groqProvider = require('../../services/ai/providers/groq.provider.js');

// -- Import the units under test -----------------------------------------------
// These are also CJS under the hood; Vitest loads them from the same cache.
import {
  generate,
  generatePracticeQuestions,
  evaluateAnswer,
  AIServiceError,
} from '../../services/ai/aiService.js';

// -- Fixtures ------------------------------------------------------------------

function validAIResponse() {
  return {
    analogyTitle: 'TCP/IP',
    nodes: [
      { id: 'n1', conceptLabel: 'Sender',   analogyLabel: 'Post office' },
      { id: 'n2', conceptLabel: 'Packet',   analogyLabel: 'Letter'      },
      { id: 'n3', conceptLabel: 'Receiver', analogyLabel: 'Destination' },
    ],
    mappings: [
      { conceptComponent: 'Sender', analogyElement: 'Post office', mappingLabel: 'Origin' },
    ],
    relationships: [
      { sourceId: 'n1', targetId: 'n2', label: 'sends', flow: true },
      { sourceId: 'n2', targetId: 'n3', label: null,    flow: false },
    ],
    explanation: 'TCP/IP works like a postal system.',
    limitations: ['Does not capture packet loss accurately.'],
  };
}

function validPracticeQuestions() {
  return [
    {
      text: 'What does the sender represent?',
      type: 'multiple-choice',
      options: [
        { text: 'Post office', isCorrect: true  },
        { text: 'Letter',      isCorrect: false },
      ],
      expectedAnswer: 'Post office',
      explanation: 'The sender initiates communication.',
      mappingLabel: 'Origin',
      encouragement: 'Great!',
    },
  ];
}

function validEvaluation() {
  return {
    correct: true,
    feedback: 'Correct!',
    correctAnswer: 'Post office',
    explanation: 'The sender maps to the post office.',
    mappingLabel: 'Origin',
    encouragement: 'Keep it up!',
    misconception: null,
  };
}

// -- Spy lifecycle -------------------------------------------------------------

let callSpy;

beforeEach(() => {
  // Create a fresh spy before each test. mockImplementation is set per-test.
  callSpy = vi.spyOn(groqProvider, 'call');
});

afterEach(() => {
  // Restore the original call function so tests never bleed into each other.
  callSpy.mockRestore();
});

// -- Helper: program the spy with a sequence of resolve/reject responses -------

function mockCallSequence(responses) {
  let index = 0;
  callSpy.mockImplementation(async () => {
    const response = responses[index++];
    if (response instanceof Error) throw response;
    return response;
  });
}

// -- generate() ----------------------------------------------------------------

describe('aiService.generate — retry logic', () => {
  it('returns result when first attempt succeeds', async () => {
    mockCallSequence([JSON.stringify(validAIResponse())]);

    const result = await generate({ concept: 'TCP/IP', analogyWorld: 'Postal' });

    expect(result).toMatchObject({ analogyTitle: 'TCP/IP' });
    expect(callSpy).toHaveBeenCalledTimes(1);
  });

  it('retries and succeeds on the third attempt when first two fail', async () => {
    mockCallSequence([
      new Error('provider error'),
      new Error('provider error'),
      JSON.stringify(validAIResponse()),
    ]);

    const result = await generate({ concept: 'TCP/IP', analogyWorld: 'Postal' });

    expect(result).toMatchObject({ analogyTitle: 'TCP/IP' });
    expect(callSpy).toHaveBeenCalledTimes(3);
  });

  it('throws AIServiceError when all three attempts fail', async () => {
    mockCallSequence([new Error('fail 1'), new Error('fail 2'), new Error('fail 3')]);

    await expect(
      generate({ concept: 'TCP/IP', analogyWorld: 'Postal' })
    ).rejects.toThrow(AIServiceError);
    expect(callSpy).toHaveBeenCalledTimes(3);
  });

  it('AIServiceError has code AI_FAILURE', async () => {
    mockCallSequence([new Error('x'), new Error('x'), new Error('x')]);

    try {
      await generate({ concept: 'A', analogyWorld: 'B' });
      expect.fail('should have thrown');
    } catch (err) {
      expect(err.code).toBe('AI_FAILURE');
    }
  });

  it('retries when provider returns invalid JSON', async () => {
    mockCallSequence([
      'not json }{',
      'still bad json',
      JSON.stringify(validAIResponse()),
    ]);

    const result = await generate({ concept: 'TCP/IP', analogyWorld: 'Postal' });

    expect(result).toMatchObject({ analogyTitle: 'TCP/IP' });
    expect(callSpy).toHaveBeenCalledTimes(3);
  });

  it('throws AIServiceError when all attempts return invalid JSON', async () => {
    mockCallSequence(['}{', '}{', '}{']);

    await expect(
      generate({ concept: 'X', analogyWorld: 'Y' })
    ).rejects.toThrow(AIServiceError);
    expect(callSpy).toHaveBeenCalledTimes(3);
  });

  it('retries when provider returns valid JSON that fails validation', async () => {
    const badResponse = {
      analogyTitle: '',
      nodes: [],
      mappings: [],
      relationships: [],
      explanation: '',
      limitations: [],
    };
    mockCallSequence([
      JSON.stringify(badResponse),
      JSON.stringify(badResponse),
      JSON.stringify(validAIResponse()),
    ]);

    const result = await generate({ concept: 'TCP/IP', analogyWorld: 'Postal' });

    expect(result).toMatchObject({ analogyTitle: 'TCP/IP' });
    expect(callSpy).toHaveBeenCalledTimes(3);
  });

  it('throws AIServiceError when all attempts return valid JSON failing validation', async () => {
    const badResponse = {
      analogyTitle: '',
      nodes: [],
      mappings: [],
      relationships: [],
      explanation: '',
      limitations: [],
    };
    mockCallSequence([
      JSON.stringify(badResponse),
      JSON.stringify(badResponse),
      JSON.stringify(badResponse),
    ]);

    await expect(
      generate({ concept: 'X', analogyWorld: 'Y' })
    ).rejects.toThrow(AIServiceError);
    expect(callSpy).toHaveBeenCalledTimes(3);
  });
});

// -- generatePracticeQuestions() -----------------------------------------------

describe('aiService.generatePracticeQuestions — retry logic', () => {
  const baseRequest = {
    concept: 'TCP/IP',
    analogyWorld: 'Postal',
    explanation: 'Works like mail.',
    mappings: [{ conceptComponent: 'Sender', analogyElement: 'Post office', mappingLabel: 'Origin' }],
    questionCount: 3,
  };

  it('returns questions when first attempt succeeds', async () => {
    mockCallSequence([JSON.stringify(validPracticeQuestions())]);

    const result = await generatePracticeQuestions(baseRequest);

    expect(Array.isArray(result)).toBe(true);
    expect(callSpy).toHaveBeenCalledTimes(1);
  });

  it('retries and succeeds on third attempt', async () => {
    mockCallSequence([
      new Error('fail'),
      new Error('fail'),
      JSON.stringify(validPracticeQuestions()),
    ]);

    const result = await generatePracticeQuestions(baseRequest);

    expect(Array.isArray(result)).toBe(true);
    expect(callSpy).toHaveBeenCalledTimes(3);
  });

  it('throws AIServiceError when all attempts fail', async () => {
    mockCallSequence([new Error('x'), new Error('x'), new Error('x')]);

    await expect(
      generatePracticeQuestions(baseRequest)
    ).rejects.toThrow(AIServiceError);
    expect(callSpy).toHaveBeenCalledTimes(3);
  });

  it('retries on invalid JSON and throws after all attempts exhausted', async () => {
    mockCallSequence(['bad', 'bad', 'bad']);

    await expect(
      generatePracticeQuestions(baseRequest)
    ).rejects.toThrow(AIServiceError);
    expect(callSpy).toHaveBeenCalledTimes(3);
  });
});

// -- evaluateAnswer() ----------------------------------------------------------

describe('aiService.evaluateAnswer — retry logic', () => {
  const baseRequest = {
    question: {
      text: 'What does the sender map to?',
      expectedAnswer: 'Post office',
      explanation: 'The sender initiates communication.',
      mappingLabel: 'Origin',
    },
    userAnswer: 'The post office',
  };

  it('returns evaluation on first successful attempt', async () => {
    mockCallSequence([JSON.stringify(validEvaluation())]);

    const result = await evaluateAnswer(baseRequest);

    expect(result).toMatchObject({ correct: true });
    expect(callSpy).toHaveBeenCalledTimes(1);
  });

  it('retries and succeeds on third attempt', async () => {
    mockCallSequence([
      new Error('fail'),
      new Error('fail'),
      JSON.stringify(validEvaluation()),
    ]);

    const result = await evaluateAnswer(baseRequest);

    expect(result).toMatchObject({ correct: true });
    expect(callSpy).toHaveBeenCalledTimes(3);
  });

  it('throws AIServiceError after all attempts exhausted', async () => {
    mockCallSequence([new Error('x'), new Error('x'), new Error('x')]);

    await expect(
      evaluateAnswer(baseRequest)
    ).rejects.toThrow(AIServiceError);
    expect(callSpy).toHaveBeenCalledTimes(3);
  });
});

// -- AIServiceError shape ------------------------------------------------------

describe('AIServiceError', () => {
  it('has name AIServiceError', () => {
    expect(new AIServiceError().name).toBe('AIServiceError');
  });

  it('has code AI_FAILURE', () => {
    expect(new AIServiceError().code).toBe('AI_FAILURE');
  });

  it('is an instance of Error', () => {
    expect(new AIServiceError()).toBeInstanceOf(Error);
  });

  it('uses default message when none supplied', () => {
    const err = new AIServiceError();
    expect(typeof err.message).toBe('string');
    expect(err.message.length).toBeGreaterThan(0);
  });
});

