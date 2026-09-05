'use strict';

import { describe, it, expect } from 'vitest';
import { build as buildGenerate }             from '../../services/ai/prompts/generate.prompt.js';
import { build as buildSimplify }             from '../../services/ai/prompts/simplify.prompt.js';
import { build as buildExpand }               from '../../services/ai/prompts/expand.prompt.js';
import { build as buildRegenerate }           from '../../services/ai/prompts/regenerate.prompt.js';
import { build as buildSwitchWorld }          from '../../services/ai/prompts/switchWorld.prompt.js';
import { build as buildPracticeQuestions }    from '../../services/ai/prompts/practiceQuestions.prompt.js';
import { build as buildPracticeEvaluate }     from '../../services/ai/prompts/practiceEvaluate.prompt.js';
import { build as buildGenerateMoreQuestions } from '../../services/ai/prompts/generateMoreQuestions.prompt.js';
import { build as buildMeaningfulness }       from '../../services/ai/prompts/meaningfulness.prompt.js';

// ─── 1. generate.prompt ───────────────────────────────────────────────────────

describe('generate.prompt — build()', () => {
  const input = { concept: 'TCP/IP', analogyWorld: 'Postal System' };

  it('returns a non-empty string', () => {
    const prompt = buildGenerate(input);
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
  });

  it('interpolates concept', () => {
    expect(buildGenerate(input)).toContain('TCP/IP');
  });

  it('interpolates analogyWorld', () => {
    expect(buildGenerate(input)).toContain('Postal System');
  });

  it('includes the JSON schema instruction', () => {
    const prompt = buildGenerate(input);
    expect(prompt).toContain('analogyTitle');
    expect(prompt).toContain('nodes');
    expect(prompt).toContain('mappings');
    expect(prompt).toContain('relationships');
    expect(prompt).toContain('limitations');
  });

  it('reminds the model that analogyTitle must NOT include the Analogy World name', () => {
    expect(buildGenerate(input)).toMatch(/MUST NOT include/i);
  });

  it('explanation field instruction mentions both concept and analogyWorld variables', () => {
    // The prompt template embeds `${concept}` and `${analogyWorld}` in the explanation rule
    const prompt = buildGenerate(input);
    expect(prompt).toContain('TCP/IP');
    expect(prompt).toContain('Postal System');
  });

  it('produces different output for different inputs', () => {
    const p1 = buildGenerate({ concept: 'A', analogyWorld: 'B' });
    const p2 = buildGenerate({ concept: 'C', analogyWorld: 'D' });
    expect(p1).not.toBe(p2);
  });
});

// ─── 2. simplify.prompt ──────────────────────────────────────────────────────

describe('simplify.prompt — build()', () => {
  const analogy = { analogyTitle: 'TCP/IP', nodes: [1, 2, 3, 4] };
  const input = {
    currentAnalogyJson: JSON.stringify(analogy),
    analogyTitle: 'TCP/IP',
    currentNodeCount: 10,
  };

  it('returns a non-empty string', () => {
    expect(typeof buildSimplify(input)).toBe('string');
  });

  it('interpolates analogyTitle', () => {
    expect(buildSimplify(input)).toContain('TCP/IP');
  });

  it('interpolates currentAnalogyJson', () => {
    expect(buildSimplify(input)).toContain(JSON.stringify(analogy));
  });

  it('calculates maxNodes as floor(currentNodeCount * 0.5)', () => {
    // 10 * 0.5 = 5
    expect(buildSimplify(input)).toContain('5');
  });

  it('enforces minimum of 1 node when currentNodeCount is 1', () => {
    const p = buildSimplify({ ...input, currentNodeCount: 1 });
    // max(1, floor(1 * 0.5)) = max(1, 0) = 1
    expect(p).toContain('1');
  });

  it('contains instruction to preserve analogyTitle', () => {
    expect(buildSimplify(input)).toMatch(/Preserve the analogyTitle/i);
  });
});

// ─── 3. expand.prompt ────────────────────────────────────────────────────────

describe('expand.prompt — build()', () => {
  const analogy = { analogyTitle: 'TCP/IP' };
  const input = {
    currentAnalogyJson: JSON.stringify(analogy),
    analogyTitle: 'TCP/IP',
    currentNodeCount: 5,
  };

  it('returns a non-empty string', () => {
    expect(typeof buildExpand(input)).toBe('string');
  });

  it('interpolates analogyTitle', () => {
    expect(buildExpand(input)).toContain('TCP/IP');
  });

  it('interpolates currentAnalogyJson', () => {
    expect(buildExpand(input)).toContain(JSON.stringify(analogy));
  });

  it('interpolates currentNodeCount', () => {
    expect(buildExpand(input)).toContain('5');
  });

  it('mentions the maximum of 20 nodes', () => {
    expect(buildExpand(input)).toContain('20');
  });

  it('contains instruction to add at least 1 new node', () => {
    expect(buildExpand(input)).toMatch(/at least 1 new node/i);
  });

  it('contains instruction to preserve analogyTitle', () => {
    expect(buildExpand(input)).toMatch(/Preserve the analogyTitle/i);
  });
});

// ─── 4. regenerate.prompt ────────────────────────────────────────────────────

describe('regenerate.prompt — build()', () => {
  const input = {
    concept: 'TCP/IP',
    analogyWorld: 'Postal System',
    analogyTitle: 'TCP/IP',
    previousNodeLabels: ['Sender', 'Packet', 'Receiver'],
  };

  it('returns a non-empty string', () => {
    expect(typeof buildRegenerate(input)).toBe('string');
  });

  it('interpolates concept', () => {
    expect(buildRegenerate(input)).toContain('TCP/IP');
  });

  it('interpolates analogyWorld', () => {
    expect(buildRegenerate(input)).toContain('Postal System');
  });

  it('interpolates analogyTitle', () => {
    expect(buildRegenerate(input)).toContain('TCP/IP');
  });

  it('lists all previousNodeLabels in the prompt', () => {
    const prompt = buildRegenerate(input);
    expect(prompt).toContain('Sender');
    expect(prompt).toContain('Packet');
    expect(prompt).toContain('Receiver');
  });

  it('instructs the model to differ from the previous analogy', () => {
    expect(buildRegenerate(input)).toMatch(/MUST differ/i);
  });

  it('handles empty previousNodeLabels gracefully', () => {
    const prompt = buildRegenerate({ ...input, previousNodeLabels: [] });
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
  });
});

// ─── 5. switchWorld.prompt ───────────────────────────────────────────────────

describe('switchWorld.prompt — build()', () => {
  const input = {
    concept: 'TCP/IP',
    newAnalogyWorld: 'Water Plumbing',
    previousAnalogyWorld: 'Postal System',
  };

  it('returns a non-empty string', () => {
    expect(typeof buildSwitchWorld(input)).toBe('string');
  });

  it('interpolates concept', () => {
    expect(buildSwitchWorld(input)).toContain('TCP/IP');
  });

  it('interpolates newAnalogyWorld', () => {
    expect(buildSwitchWorld(input)).toContain('Water Plumbing');
  });

  it('interpolates previousAnalogyWorld', () => {
    expect(buildSwitchWorld(input)).toContain('Postal System');
  });

  it('instructs the model to use the new world', () => {
    expect(buildSwitchWorld(input)).toContain('Water Plumbing');
  });

  it('produces different prompts for different world pairs', () => {
    const p1 = buildSwitchWorld({ concept: 'X', newAnalogyWorld: 'A', previousAnalogyWorld: 'B' });
    const p2 = buildSwitchWorld({ concept: 'X', newAnalogyWorld: 'C', previousAnalogyWorld: 'D' });
    expect(p1).not.toBe(p2);
  });
});

// ─── 6. practiceQuestions.prompt ─────────────────────────────────────────────

describe('practiceQuestions.prompt — build()', () => {
  const mappings = [
    { conceptComponent: 'Sender', analogyElement: 'Post office', mappingLabel: 'Origin' },
  ];
  const input = {
    concept: 'TCP/IP',
    analogyWorld: 'Postal System',
    explanation: 'TCP/IP works like a postal system.',
    mappings,
    questionCount: 3,
  };

  it('returns a non-empty string', () => {
    expect(typeof buildPracticeQuestions(input)).toBe('string');
  });

  it('interpolates concept', () => {
    expect(buildPracticeQuestions(input)).toContain('TCP/IP');
  });

  it('interpolates analogyWorld', () => {
    expect(buildPracticeQuestions(input)).toContain('Postal System');
  });

  it('interpolates explanation', () => {
    expect(buildPracticeQuestions(input)).toContain('TCP/IP works like a postal system.');
  });

  it('includes serialized mappings JSON', () => {
    const prompt = buildPracticeQuestions(input);
    expect(prompt).toContain('Origin');
    expect(prompt).toContain('Post office');
  });

  it('interpolates questionCount', () => {
    expect(buildPracticeQuestions(input)).toContain('3');
  });

  it('includes the JSON array return instruction', () => {
    expect(buildPracticeQuestions(input)).toMatch(/Return ONLY valid JSON array/i);
  });

  it('mentions mappingLabel rule', () => {
    expect(buildPracticeQuestions(input)).toContain('mappingLabel');
  });
});

// ─── 7. practiceEvaluate.prompt ──────────────────────────────────────────────

describe('practiceEvaluate.prompt — build()', () => {
  const question = {
    text: 'What does the sender represent?',
    expectedAnswer: 'Post office',
    explanation: 'The sender initiates all communication.',
    mappingLabel: 'Origin',
  };
  const input = { question, userAnswer: 'The post office' };

  it('returns a non-empty string', () => {
    expect(typeof buildPracticeEvaluate(input)).toBe('string');
  });

  it('interpolates question.text', () => {
    expect(buildPracticeEvaluate(input)).toContain('What does the sender represent?');
  });

  it('interpolates question.expectedAnswer', () => {
    expect(buildPracticeEvaluate(input)).toContain('Post office');
  });

  it('interpolates userAnswer', () => {
    expect(buildPracticeEvaluate(input)).toContain('The post office');
  });

  it('interpolates question.explanation', () => {
    expect(buildPracticeEvaluate(input)).toContain('The sender initiates all communication.');
  });

  it('interpolates question.mappingLabel', () => {
    expect(buildPracticeEvaluate(input)).toContain('Origin');
  });

  it('includes the JSON return schema', () => {
    const prompt = buildPracticeEvaluate(input);
    expect(prompt).toContain('"correct"');
    expect(prompt).toContain('"feedback"');
    expect(prompt).toContain('"misconception"');
  });

  it('mentions semantic correctness', () => {
    expect(buildPracticeEvaluate(input)).toMatch(/semantic/i);
  });
});

// ─── 8. generateMoreQuestions.prompt ─────────────────────────────────────────

describe('generateMoreQuestions.prompt — build()', () => {
  const mappings = [
    { conceptComponent: 'Sender', analogyElement: 'Post office', mappingLabel: 'Origin' },
  ];
  const previousQuestions = ['What does the sender represent?'];
  const input = {
    concept: 'TCP/IP',
    analogyWorld: 'Postal System',
    explanation: 'Works like mail.',
    mappings,
    questionCount: 3,
    previousQuestions,
  };

  it('returns a non-empty string', () => {
    expect(typeof buildGenerateMoreQuestions(input)).toBe('string');
  });

  it('interpolates concept', () => {
    expect(buildGenerateMoreQuestions(input)).toContain('TCP/IP');
  });

  it('interpolates analogyWorld', () => {
    expect(buildGenerateMoreQuestions(input)).toContain('Postal System');
  });

  it('includes serialized previousQuestions', () => {
    expect(buildGenerateMoreQuestions(input)).toContain('What does the sender represent?');
  });

  it('includes serialized mappings', () => {
    expect(buildGenerateMoreQuestions(input)).toContain('Origin');
  });

  it('interpolates questionCount', () => {
    expect(buildGenerateMoreQuestions(input)).toContain('3');
  });

  it('instructs the model to avoid duplicate questions', () => {
    expect(buildGenerateMoreQuestions(input)).toMatch(/MUST be different/i);
  });

  it('handles empty previousQuestions gracefully', () => {
    const prompt = buildGenerateMoreQuestions({ ...input, previousQuestions: [] });
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
  });

  it('handles undefined previousQuestions gracefully', () => {
    const prompt = buildGenerateMoreQuestions({ ...input, previousQuestions: undefined });
    expect(typeof prompt).toBe('string');
  });

  it('produces different output than practiceQuestions.prompt for same core inputs', () => {
    const p1 = buildPracticeQuestions({ concept: 'X', analogyWorld: 'Y', explanation: 'E', mappings, questionCount: 3 });
    const p2 = buildGenerateMoreQuestions({ ...input, concept: 'X', analogyWorld: 'Y', explanation: 'E', questionCount: 3 });
    expect(p1).not.toBe(p2);
  });
});

// ─── 9. meaningfulness.prompt ────────────────────────────────────────────────

describe('meaningfulness.prompt — build()', () => {
  it('returns a non-empty string', () => {
    expect(typeof buildMeaningfulness({ concept: 'photosynthesis' })).toBe('string');
  });

  it('interpolates concept', () => {
    expect(buildMeaningfulness({ concept: 'photosynthesis' })).toContain('photosynthesis');
  });

  it('includes the JSON return schema with valid, reason, message', () => {
    const prompt = buildMeaningfulness({ concept: 'X' });
    expect(prompt).toContain('"valid"');
    expect(prompt).toContain('"reason"');
    expect(prompt).toContain('"message"');
  });

  it('explicitly instructs NOT to use a hardcoded blacklist', () => {
    expect(buildMeaningfulness({ concept: 'X' })).toMatch(/NOT.*blacklist|hardcoded blacklist/i);
  });

  it('indicates that everyday objects are VALID', () => {
    expect(buildMeaningfulness({ concept: 'X' })).toMatch(/VALID/);
  });

  it('produces different prompts for different concepts', () => {
    const p1 = buildMeaningfulness({ concept: 'quantum entanglement' });
    const p2 = buildMeaningfulness({ concept: 'asdfghjkl' });
    expect(p1).not.toBe(p2);
  });

  it('handles special characters in concept without throwing', () => {
    expect(() => buildMeaningfulness({ concept: '<script>alert(1)</script>' })).not.toThrow();
  });
});
