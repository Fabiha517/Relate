import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['src/__tests__/setup.js'],
    include: [
      'src/__tests__/**/*.test.js',
      'src/__tests__/**/*.test.mjs',
      'src/**/*.test.js',
      'src/**/*.test.mjs',
    ],
  },
});
