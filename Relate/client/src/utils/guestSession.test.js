import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as guestSession from './guestSession';

describe('guestSession', () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('set', () => {
    it('should store an analogy object in sessionStorage', () => {
      const analogy = {
        id: '123',
        title: 'Test Analogy',
        concept: 'API',
        world: 'Restaurant',
      };

      guestSession.set(analogy);

      const stored = sessionStorage.getItem('guestAnalogy');
      expect(stored).toBeDefined();
      expect(JSON.parse(stored)).toEqual(analogy);
    });

    it('should overwrite existing analogy', () => {
      const analogy1 = { id: '1', title: 'First' };
      const analogy2 = { id: '2', title: 'Second' };

      guestSession.set(analogy1);
      guestSession.set(analogy2);

      const stored = JSON.parse(sessionStorage.getItem('guestAnalogy'));
      expect(stored).toEqual(analogy2);
    });

    it('should handle complex nested objects', () => {
      const analogy = {
        id: '456',
        title: 'Complex Analogy',
        nodes: [
          { id: 'n1', label: 'Node 1' },
          { id: 'n2', label: 'Node 2' },
        ],
        edges: [
          { source: 'n1', target: 'n2', label: 'connects' },
        ],
        explanation: 'This is an explanation',
        limitations: ['Limit 1', 'Limit 2'],
      };

      guestSession.set(analogy);

      const stored = JSON.parse(sessionStorage.getItem('guestAnalogy'));
      expect(stored).toEqual(analogy);
    });

    it('should handle arrays', () => {
      const analogy = [
        { id: '1', value: 'first' },
        { id: '2', value: 'second' },
      ];

      guestSession.set(analogy);

      const stored = JSON.parse(sessionStorage.getItem('guestAnalogy'));
      expect(Array.isArray(stored)).toBe(true);
      expect(stored).toEqual(analogy);
    });
  });

  describe('get', () => {
    it('should retrieve stored analogy', () => {
      const analogy = {
        id: '789',
        title: 'Test Retrieve',
        concept: 'Database',
      };

      sessionStorage.setItem('guestAnalogy', JSON.stringify(analogy));

      const retrieved = guestSession.get();
      expect(retrieved).toEqual(analogy);
    });

    it('should return null if no analogy is stored', () => {
      const result = guestSession.get();
      expect(result).toBeNull();
    });

    it('should return null if stored data is invalid JSON', () => {
      sessionStorage.setItem('guestAnalogy', 'invalid json {[}');

      const result = guestSession.get();
      expect(result).toBeNull();
    });

    it('should handle empty string gracefully', () => {
      sessionStorage.setItem('guestAnalogy', '');

      const result = guestSession.get();
      expect(result).toBeNull();
    });

    it('should parse and return complex objects correctly', () => {
      const analogy = {
        id: '999',
        nested: {
          deep: {
            value: 'found it',
          },
        },
        array: [1, 2, 3],
      };

      sessionStorage.setItem('guestAnalogy', JSON.stringify(analogy));

      const retrieved = guestSession.get();
      expect(retrieved).toEqual(analogy);
      expect(retrieved.nested.deep.value).toBe('found it');
      expect(retrieved.array).toEqual([1, 2, 3]);
    });

    it('should return null on JSON parse error', () => {
      // Store something that looks like JSON but isn't quite valid
      sessionStorage.setItem('guestAnalogy', '{broken json}');

      const result = guestSession.get();
      expect(result).toBeNull();
    });
  });

  describe('clear', () => {
    it('should remove analogy from sessionStorage', () => {
      const analogy = { id: '111', title: 'To Clear' };
      guestSession.set(analogy);

      const result = guestSession.clear();

      expect(result).toBeNull();
      expect(sessionStorage.getItem('guestAnalogy')).toBeNull();
    });

    it('should return null', () => {
      const result = guestSession.clear();
      expect(result).toBeNull();
    });

    it('should be safe to call when nothing is stored', () => {
      expect(() => {
        guestSession.clear();
      }).not.toThrow();

      expect(sessionStorage.getItem('guestAnalogy')).toBeNull();
    });

    it('should completely remove the key', () => {
      const analogy = { id: '222', title: 'Remove Me' };
      guestSession.set(analogy);
      expect(sessionStorage.getItem('guestAnalogy')).not.toBeNull();

      guestSession.clear();
      expect(sessionStorage.getItem('guestAnalogy')).toBeNull();
    });
  });

  describe('integration', () => {
    it('should support full set-get-clear cycle', () => {
      const analogy = {
        id: '333',
        title: 'Integration Test',
        concept: 'Cycle Test',
      };

      // Initially empty
      expect(guestSession.get()).toBeNull();

      // Set
      guestSession.set(analogy);
      expect(guestSession.get()).toEqual(analogy);

      // Update
      const updated = { ...analogy, title: 'Updated Title' };
      guestSession.set(updated);
      expect(guestSession.get()).toEqual(updated);

      // Clear
      guestSession.clear();
      expect(guestSession.get()).toBeNull();
    });

    it('should persist data across multiple get calls', () => {
      const analogy = { id: '444', title: 'Persistence' };

      guestSession.set(analogy);

      const first = guestSession.get();
      const second = guestSession.get();

      expect(first).toEqual(analogy);
      expect(second).toEqual(analogy);
      expect(first).toEqual(second);
    });

    it('should handle storing and retrieving empty objects', () => {
      const emptyAnalogy = {};

      guestSession.set(emptyAnalogy);
      const retrieved = guestSession.get();

      expect(retrieved).toEqual({});
    });
  });

  describe('error handling', () => {
    it('should not throw when sessionStorage fails', () => {
      const analogy = { id: '555' };

      // Mock sessionStorage to throw
      const originalSetItem = sessionStorage.setItem;
      sessionStorage.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => {
        guestSession.set(analogy);
      }).not.toThrow();

      // Restore
      sessionStorage.setItem = originalSetItem;
    });

    it('should handle malformed JSON gracefully in get', () => {
      sessionStorage.setItem('guestAnalogy', 'undefined');

      expect(() => {
        guestSession.get();
      }).not.toThrow();

      expect(guestSession.get()).toBeNull();
    });

    it('should handle null stored value', () => {
      sessionStorage.setItem('guestAnalogy', null);

      const result = guestSession.get();
      expect(result).toBeNull();
    });
  });

  describe('data types', () => {
    it('should preserve string values', () => {
      const analogy = { title: 'String Test' };
      guestSession.set(analogy);
      expect(guestSession.get().title).toBe('String Test');
    });

    it('should preserve number values', () => {
      const analogy = { count: 42, rating: 3.14 };
      guestSession.set(analogy);
      const retrieved = guestSession.get();
      expect(retrieved.count).toBe(42);
      expect(retrieved.rating).toBe(3.14);
    });

    it('should preserve boolean values', () => {
      const analogy = { active: true, deleted: false };
      guestSession.set(analogy);
      const retrieved = guestSession.get();
      expect(retrieved.active).toBe(true);
      expect(retrieved.deleted).toBe(false);
    });

    it('should preserve null values in objects', () => {
      const analogy = { value: null, name: 'Test' };
      guestSession.set(analogy);
      const retrieved = guestSession.get();
      expect(retrieved.value).toBeNull();
      expect(retrieved.name).toBe('Test');
    });

    it('should handle arrays of various types', () => {
      const analogy = {
        mixed: [1, 'two', true, null, { nested: 'obj' }],
      };
      guestSession.set(analogy);
      const retrieved = guestSession.get();
      expect(retrieved.mixed).toEqual(analogy.mixed);
    });
  });
});
