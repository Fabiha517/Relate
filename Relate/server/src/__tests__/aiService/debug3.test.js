import { describe, it, expect, vi } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

describe('require cache patching', () => {
  it('can patch the providers module via require.cache', async () => {
    // First, load providers to get its cache key
    const providersPath = require.resolve('../../services/ai/providers/index.js');
    console.log('providers resolved path:', providersPath);

    // Load aiService normally to get it in cache first
    const aiServicePath = require.resolve('../../services/ai/aiService.js');

    // Patch providers in the require cache
    const mockCall = vi.fn().mockResolvedValue('{}');
    
    // Replace/inject the mock into require.cache
    require.cache[providersPath] = {
      id: providersPath,
      filename: providersPath,
      loaded: true,
      exports: { getProvider: () => ({ call: mockCall }) },
      parent: null,
      children: [],
      paths: [],
    };

    // Delete aiService from cache so it reloads with the patched providers
    delete require.cache[aiServicePath];

    // Now require aiService fresh — it will use our patched providers
    const aiService = require('../../services/ai/aiService.js');

    console.log('aiService functions:', Object.keys(aiService));

    try {
      await aiService.generate({ concept: 'X', analogyWorld: 'Y' });
    } catch(e) {
      // ignore
    }

    console.log('mockCall calls:', mockCall.mock.calls.length);
  });
});
