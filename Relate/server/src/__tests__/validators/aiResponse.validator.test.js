'use strict';

import { describe, it, expect } from 'vitest';
import {
  validateAIResponse,
  ValidationError,
} from '../../services/ai/validators/aiResponse.validator.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns a minimal valid AI_Response object that passes all checks. */
function validResponse() {
  return {
    analogyTitle: 'TCP/IP',
    nodes: [
      { id: 'n1', conceptLabel: 'Sender',   analogyLabel: 'Post office'  },
      { id: 'n2', conceptLabel: 'Packet',   analogyLabel: 'Letter'        },
      { id: 'n3', conceptLabel: 'Receiver', analogyLabel: 'Destination'   },
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

// ─── Top-level shape ──────────────────────────────────────────────────────────

describe('validateAIResponse — top-level shape', () => {
  it('accepts a fully valid object and returns it', () => {
    const data = validResponse();
    expect(validateAIResponse(data)).toBe(data);
  });

  it('rejects null', () => {
    expect(() => validateAIResponse(null)).toThrow(ValidationError);
  });

  it('rejects an array', () => {
    expect(() => validateAIResponse([])).toThrow(ValidationError);
  });

  it('rejects a primitive', () => {
    expect(() => validateAIResponse('string')).toThrow(ValidationError);
  });
});

// ─── analogyTitle ─────────────────────────────────────────────────────────────

describe('validateAIResponse — analogyTitle', () => {
  it('rejects missing analogyTitle', () => {
    const data = validResponse();
    delete data.analogyTitle;
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });

  it('rejects empty string analogyTitle', () => {
    const data = validResponse();
    data.analogyTitle = '';
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });

  it('rejects whitespace-only analogyTitle', () => {
    const data = validResponse();
    data.analogyTitle = '   ';
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });

  it('rejects non-string analogyTitle', () => {
    const data = validResponse();
    data.analogyTitle = 42;
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });
});

// ─── nodes ────────────────────────────────────────────────────────────────────

describe('validateAIResponse — nodes', () => {
  it('rejects nodes count < 3', () => {
    const data = validResponse();
    data.nodes = data.nodes.slice(0, 2); // only 2
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });

  it('rejects nodes count > 20', () => {
    const data = validResponse();
    data.nodes = Array.from({ length: 21 }, (_, i) => ({
      id: `n${i + 1}`,
      conceptLabel: `C${i}`,
      analogyLabel: `A${i}`,
    }));
    // relationships would break referential integrity with old IDs; clear them
    data.relationships = [];
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });

  it('accepts nodes count exactly 3', () => {
    expect(() => validateAIResponse(validResponse())).not.toThrow();
  });

  it('accepts nodes count exactly 20', () => {
    const data = validResponse();
    data.nodes = Array.from({ length: 20 }, (_, i) => ({
      id: `n${i + 1}`,
      conceptLabel: `C${i}`,
      analogyLabel: `A${i}`,
    }));
    data.relationships = [];
    expect(() => validateAIResponse(data)).not.toThrow();
  });

  it('rejects non-array nodes', () => {
    const data = validResponse();
    data.nodes = 'not an array';
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });

  it('rejects a node with empty id', () => {
    const data = validResponse();
    data.nodes[0].id = '';
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });

  it('rejects a node with missing conceptLabel', () => {
    const data = validResponse();
    delete data.nodes[0].conceptLabel;
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });

  it('rejects a node with empty analogyLabel', () => {
    const data = validResponse();
    data.nodes[0].analogyLabel = '';
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });
});

// ─── mappings ─────────────────────────────────────────────────────────────────

describe('validateAIResponse — mappings', () => {
  it('rejects empty mappings array', () => {
    const data = validResponse();
    data.mappings = [];
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });

  it('rejects non-array mappings', () => {
    const data = validResponse();
    data.mappings = null;
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });

  it('rejects a mapping with empty conceptComponent', () => {
    const data = validResponse();
    data.mappings[0].conceptComponent = '';
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });

  it('rejects a mapping with empty analogyElement', () => {
    const data = validResponse();
    data.mappings[0].analogyElement = '';
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });

  it('rejects a mapping with empty mappingLabel', () => {
    const data = validResponse();
    data.mappings[0].mappingLabel = '';
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });

  it('rejects a mapping with whitespace-only mappingLabel', () => {
    const data = validResponse();
    data.mappings[0].mappingLabel = '   ';
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });
});

// ─── relationships ────────────────────────────────────────────────────────────

describe('validateAIResponse — relationships', () => {
  it('accepts an empty relationships array', () => {
    const data = validResponse();
    data.relationships = [];
    expect(() => validateAIResponse(data)).not.toThrow();
  });

  it('rejects non-array relationships', () => {
    const data = validResponse();
    data.relationships = 'wrong';
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });

  it('rejects a relationship with empty sourceId', () => {
    const data = validResponse();
    data.relationships[0].sourceId = '';
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });

  it('rejects a relationship with empty targetId', () => {
    const data = validResponse();
    data.relationships[0].targetId = '';
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });

  // ── self-loops ───────────────────────────────────────────────────────────

  it('rejects a self-loop (sourceId === targetId)', () => {
    const data = validResponse();
    data.relationships[0].sourceId = 'n1';
    data.relationships[0].targetId = 'n1';
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });

  it('error message for self-loop mentions "self-loop"', () => {
    const data = validResponse();
    data.relationships[0].sourceId = 'n2';
    data.relationships[0].targetId = 'n2';
    try {
      validateAIResponse(data);
      expect.fail('should have thrown');
    } catch (err) {
      expect(err.message).toMatch(/self-loop/i);
    }
  });

  // ── referential integrity ─────────────────────────────────────────────────

  it('rejects relationship whose sourceId does not reference an existing node', () => {
    const data = validResponse();
    data.relationships[0].sourceId = 'ghost_node';
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });

  it('rejects relationship whose targetId does not reference an existing node', () => {
    const data = validResponse();
    data.relationships[0].targetId = 'ghost_node';
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });

  // ── label ─────────────────────────────────────────────────────────────────

  it('accepts label as a string', () => {
    const data = validResponse();
    data.relationships[0].label = 'sends';
    expect(() => validateAIResponse(data)).not.toThrow();
  });

  it('accepts label as null', () => {
    const data = validResponse();
    data.relationships[0].label = null;
    expect(() => validateAIResponse(data)).not.toThrow();
  });

  it('accepts label as undefined (optional)', () => {
    const data = validResponse();
    delete data.relationships[0].label;
    expect(() => validateAIResponse(data)).not.toThrow();
  });

  it('rejects label as a number', () => {
    const data = validResponse();
    data.relationships[0].label = 42;
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });

  it('rejects label as an object', () => {
    const data = validResponse();
    data.relationships[0].label = {};
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });

  // ── flow ──────────────────────────────────────────────────────────────────

  it('accepts flow: true', () => {
    const data = validResponse();
    data.relationships[0].flow = true;
    expect(() => validateAIResponse(data)).not.toThrow();
  });

  it('accepts flow: false', () => {
    const data = validResponse();
    data.relationships[0].flow = false;
    expect(() => validateAIResponse(data)).not.toThrow();
  });

  it('accepts flow as undefined (optional)', () => {
    const data = validResponse();
    delete data.relationships[0].flow;
    expect(() => validateAIResponse(data)).not.toThrow();
  });

  it('rejects flow as a string', () => {
    const data = validResponse();
    data.relationships[0].flow = 'true';
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });

  it('rejects flow as 1 (number)', () => {
    const data = validResponse();
    data.relationships[0].flow = 1;
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });
});

// ─── explanation ──────────────────────────────────────────────────────────────

describe('validateAIResponse — explanation', () => {
  it('rejects missing explanation', () => {
    const data = validResponse();
    delete data.explanation;
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });

  it('rejects empty explanation', () => {
    const data = validResponse();
    data.explanation = '';
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });

  it('rejects whitespace-only explanation', () => {
    const data = validResponse();
    data.explanation = '   ';
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });
});

// ─── limitations ─────────────────────────────────────────────────────────────

describe('validateAIResponse — limitations', () => {
  it('rejects empty limitations array (length = 0)', () => {
    const data = validResponse();
    data.limitations = [];
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });

  it('rejects limitations.length > 10', () => {
    const data = validResponse();
    data.limitations = Array.from({ length: 11 }, (_, i) => `limitation ${i}`);
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });

  it('accepts limitations.length exactly 1', () => {
    const data = validResponse();
    data.limitations = ['One limitation'];
    expect(() => validateAIResponse(data)).not.toThrow();
  });

  it('accepts limitations.length exactly 10', () => {
    const data = validResponse();
    data.limitations = Array.from({ length: 10 }, (_, i) => `limitation ${i}`);
    expect(() => validateAIResponse(data)).not.toThrow();
  });

  it('rejects non-array limitations', () => {
    const data = validResponse();
    data.limitations = 'not an array';
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });

  it('rejects a limitations entry that is an empty string', () => {
    const data = validResponse();
    data.limitations = [''];
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });

  it('rejects a limitations entry that is not a string', () => {
    const data = validResponse();
    data.limitations = [42];
    expect(() => validateAIResponse(data)).toThrow(ValidationError);
  });
});

// ─── ValidationError metadata ─────────────────────────────────────────────────

describe('ValidationError', () => {
  it('has name ValidationError', () => {
    try {
      validateAIResponse(null);
    } catch (err) {
      expect(err.name).toBe('ValidationError');
    }
  });

  it('has code VALIDATION_ERROR', () => {
    try {
      validateAIResponse(null);
    } catch (err) {
      expect(err.code).toBe('VALIDATION_ERROR');
    }
  });
});
