import { describe, it, expect, vi, beforeEach } from 'vitest';

// Import providers module — Vitest transforms CJS to ESM, making exports mutable
import * as providers from '../../services/ai/providers/index.js';

describe('spyOn approach', () => {
  it('can spy on getProvider', async () => {
    const mockCall = vi.fn().mockResolvedValue('{}');
    vi.spyOn(providers, 'getProvider').mockReturnValue({ call: mockCall });

    // Now import aiService which uses providers.getProvider
    const { generate } = await import('../../services/ai/aiService.js');

    console.log('providers.getProvider isMock:', vi.isMockFunction(providers.getProvider));

    try {
      await generate({ concept: 'X', analogyWorld: 'Y' });
    } catch(e) {
      // ignore
    }

    console.log('mockCall calls:', mockCall.mock.calls.length);
    console.log('getProvider calls:', providers.getProvider.mock?.calls?.length ?? 'not a mock');
  });
});
