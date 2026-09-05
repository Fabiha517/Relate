import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../services/ai/providers/index.js', () => ({
  getProvider: vi.fn(),
}));

import { getProvider } from '../../services/ai/providers/index.js';
import { generate, AIServiceError } from '../../services/ai/aiService.js';

describe('debug mock wiring', () => {
  it('getProvider should be a vi.fn', () => {
    console.log('getProvider:', getProvider);
    console.log('isMockFunction:', vi.isMockFunction(getProvider));
    expect(vi.isMockFunction(getProvider)).toBe(true);
  });

  it('calling generate calls getProvider', async () => {
    const mockCall = vi.fn().mockResolvedValue(JSON.stringify({
      analogyTitle: 'Test',
      nodes: [
        { id: 'n1', conceptLabel: 'A', analogyLabel: 'B' },
        { id: 'n2', conceptLabel: 'C', analogyLabel: 'D' },
        { id: 'n3', conceptLabel: 'E', analogyLabel: 'F' },
      ],
      mappings: [{ conceptComponent: 'A', analogyElement: 'B', mappingLabel: 'M' }],
      relationships: [{ sourceId: 'n1', targetId: 'n2', label: 'goes', flow: true }],
      explanation: 'Some explanation here.',
      limitations: ['One limitation.'],
    }));
    getProvider.mockReturnValue({ call: mockCall });
    console.log('getProvider.mock.results before call:', getProvider.mock.results.length);
    try {
      const r = await generate({ concept: 'X', analogyWorld: 'Y' });
      console.log('generate result:', r);
    } catch(e) {
      console.log('generate error:', e.message);
    }
    console.log('getProvider was called:', getProvider.mock.calls.length, 'times');
    console.log('mockCall was called:', mockCall.mock.calls.length, 'times');
  });
});
