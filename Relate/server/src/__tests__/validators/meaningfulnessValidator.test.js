'use strict';

/**
 * Unit tests for meaningfulnessValidator.js
 *
 * Mocking strategy:
 *   meaningfulnessValidator.js requires aiService via CJS require(). The same
 *   module object is cached by Node. vi.mock() cannot intercept CJS cache hits,
 *   so we use vi.spyOn on the real aiService module object instead — the same
 *   reference that meaningfulnessValidator.js holds internally.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Grab the real cached aiService object — same reference meaningfulnessValidator uses.
const aiService = require('../../services/ai/aiService.js');

// Import the unit under test AFTER requiring aiService so the cache is warm.
import { validate } from '../../services/ai/meaningfulnessValidator.js';

// ── Spy lifecycle ─────────────────────────────────────────────────────────────

let validateMeaningfulnessSpy;

beforeEach(() => {
  validateMeaningfulnessSpy = vi.spyOn(aiService, 'validateMeaningfulness');
});

afterEach(() => {
  validateMeaningfulnessSpy.mockRestore();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('meaningfulnessValidator.validate', () => {
  it('delegates to aiService.validateMeaningfulness', async () => {
    const mockResult = { valid: true, reason: 'a concept', message: '' };
    validateMeaningfulnessSpy.mockResolvedValue(mockResult);

    const result = await validate('photosynthesis');

    expect(validateMeaningfulnessSpy).toHaveBeenCalledOnce();
    expect(validateMeaningfulnessSpy).toHaveBeenCalledWith('photosynthesis');
    expect(result).toBe(mockResult);
  });

  it('passes the concept argument through unchanged', async () => {
    const mockResult = { valid: false, reason: 'random chars', message: 'Not meaningful.' };
    validateMeaningfulnessSpy.mockResolvedValue(mockResult);

    await validate('asdfjkl;');

    expect(validateMeaningfulnessSpy).toHaveBeenCalledWith('asdfjkl;');
  });

  it('returns { valid: true, reason, message } when concept is valid', async () => {
    const mockResult = { valid: true, reason: 'meaningful concept', message: '' };
    validateMeaningfulnessSpy.mockResolvedValue(mockResult);

    const result = await validate('quantum entanglement');

    expect(result).toHaveProperty('valid', true);
    expect(result).toHaveProperty('reason');
    expect(result).toHaveProperty('message');
  });

  it('returns { valid: false, reason, message } when concept is invalid', async () => {
    const mockResult = {
      valid: false,
      reason: 'nonsensical',
      message: 'Input does not appear to be meaningful.',
    };
    validateMeaningfulnessSpy.mockResolvedValue(mockResult);

    const result = await validate('xkjvhfkjdhfkjshdf');

    expect(result).toHaveProperty('valid', false);
    expect(result).toHaveProperty('reason');
    expect(typeof result.message).toBe('string');
  });

  it('propagates errors thrown by aiService.validateMeaningfulness', async () => {
    const err = new Error('AI_FAILURE');
    validateMeaningfulnessSpy.mockRejectedValue(err);

    await expect(validate('any concept')).rejects.toThrow('AI_FAILURE');
  });

  it('does NOT call aiService.validateMeaningfulness more than once per validate call', async () => {
    validateMeaningfulnessSpy.mockResolvedValue({ valid: true, reason: 'ok', message: '' });

    await validate('blockchain');

    expect(validateMeaningfulnessSpy).toHaveBeenCalledTimes(1);
  });
});
