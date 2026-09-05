import { describe, it, expect } from 'vitest';
import { truncate } from './truncate';

describe('truncate', () => {
  it('should return string as-is if under limit', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
    expect(truncate('Hi', 5)).toBe('Hi');
  });

  it('should return string as-is if exactly at limit', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
    expect(truncate('World', 5)).toBe('World');
  });

  it('should truncate and add ellipsis if over limit', () => {
    expect(truncate('Hello World', 8)).toBe('Hello...');
    expect(truncate('This is a test', 10)).toBe('This is...');
  });

  it('should handle maxLen = 3 exactly', () => {
    expect(truncate('Hello', 3)).toBe('...');
  });

  it('should handle maxLen < 3', () => {
    expect(truncate('Hello', 2)).toBe('He...');
    expect(truncate('Hello', 1)).toBe('H...');
    expect(truncate('Hello', 0)).toBe('...');
  });

  it('should work with node label truncation (60 chars)', () => {
    const longLabel = 'This is a very long node label that exceeds sixty characters and should be truncated';
    const result = truncate(longLabel, 60);
    expect(result.length).toBeLessThanOrEqual(60);
    expect(result).toBe(longLabel.substring(0, 57) + '...');
  });

  it('should work with concept truncation (100 chars)', () => {
    const concept = 'A'.repeat(150);
    const result = truncate(concept, 100);
    expect(result.length).toBe(100);
    expect(result).toBe('A'.repeat(97) + '...');
  });

  it('should handle empty string', () => {
    expect(truncate('', 10)).toBe('');
    expect(truncate('', 5)).toBe('');
  });

  it('should handle special characters', () => {
    const text = 'Hello! @#$% World & More * Stuff';
    expect(truncate(text, 15)).toBe('Hello! @#$% ...');
  });

  it('should handle unicode characters', () => {
    const text = 'Hello 👋 World 🌍';
    expect(truncate(text, 12)).toBe('Hello 👋 ...');
  });

  it('should preserve leading/trailing spaces before truncation', () => {
    const text = '  Hello World  ';
    expect(truncate(text, 10)).toBe('  Hello...');
  });

  it('should handle single character strings', () => {
    expect(truncate('A', 1)).toBe('A');
    expect(truncate('A', 0)).toBe('...');
  });

  it('should handle multiple spaces', () => {
    const text = 'Word1    Word2    Word3';
    expect(truncate(text, 15)).toBe('Word1    Wor...');
  });

  it('should handle newlines and tabs', () => {
    const text = 'Line1\nLine2\tTabbed';
    expect(truncate(text, 10)).toBe('Line1\nL...');
  });

  it('should consistently truncate at same length', () => {
    const result1 = truncate('Test string for truncation', 15);
    const result2 = truncate('Test string for truncation', 15);
    expect(result1).toBe(result2);
    expect(result1.length).toBe(15);
  });

  it('should handle maxLen larger than string length', () => {
    expect(truncate('Hi', 1000)).toBe('Hi');
  });

  it('should handle very small maxLen values', () => {
    expect(truncate('A', 1)).toBe('A');
    expect(truncate('AB', 1)).toBe('A...');
    expect(truncate('ABC', 1)).toBe('A...');
  });
});
