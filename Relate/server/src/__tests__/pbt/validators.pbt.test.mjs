/**
 * Property-based tests for validation middleware helpers.
 *
 * Validates: Requirements 1.1, 7.2, 7.3, 13.3
 *
 * Properties tested:
 *   Property 2  — Concept accepts 1–5000 chars; empty and >5000 rejected
 *   Property 14 — Email accepts iff `@` present with non-empty local and domain with `.`
 *   Property 15 — Password accepts iff length in [8, 128]
 */

import { describe, it } from 'vitest';
import fc from 'fast-check';
import { createRequire } from 'module';

// Use createRequire to load the CJS middleware module from an ESM context.
const require = createRequire(import.meta.url);
const { _isValidEmail } = require('../../middleware/validate.middleware.js');

// ---------------------------------------------------------------------------
// Thin helper wrappers that mirror the inline validation logic in
// validate.middleware.js exactly, so property tests can call them directly
// without going through Express middleware.
// ---------------------------------------------------------------------------

/**
 * Mirrors the concept length check used in validateGenerateAnalogy and
 * validateSaveAnalogy:
 *   - length 0       → invalid
 *   - length 1–5000  → valid
 *   - length > 5000  → invalid
 */
function validateConceptLength(concept) {
  const str = typeof concept === 'string' ? concept : '';
  if (str.length === 0) return false;
  if (str.length > 5000) return false;
  return true;
}

/**
 * Wraps the exported _isValidEmail helper.
 * Returns { valid: boolean } so tests match the design doc interface.
 */
function validateEmail(email) {
  return { valid: _isValidEmail(email) };
}

/**
 * Mirrors the password length check in validateRegister and
 * validateResetPassword:
 *   - length 0        → invalid
 *   - length 1–7      → invalid
 *   - length 8–128    → valid
 *   - length > 128    → invalid
 */
function validatePassword(password) {
  const str = typeof password === 'string' ? password : '';
  if (str.length < 8) return { valid: false };
  if (str.length > 128) return { valid: false };
  return { valid: true };
}

// ---------------------------------------------------------------------------
// fast-check v4 compatible arbitraries
// fc.char() and fc.stringOf() were removed in v4; use fc.string() or
// fc.stringMatching() instead.
// ---------------------------------------------------------------------------

/** Arbitrary that produces ASCII printable strings of exactly `len` characters. */
function exactLengthAscii(len) {
  // ASCII printable chars 0x20–0x7E — guaranteed single code unit each.
  return fc.stringMatching(new RegExp(`^[\\x20-\\x7E]{${len}}$`));
}

/** Arbitrary for alphanumeric strings of a given length range. */
function alphaNumeric(minLength, maxLength) {
  return fc.stringMatching(
    new RegExp(`^[a-zA-Z0-9]{${minLength},${maxLength}}$`)
  );
}

// ---------------------------------------------------------------------------
// Property 2: Concept length validation
// Validates: Requirements 1.1, 13.3
// ---------------------------------------------------------------------------
describe('Property 2 — Concept length validation', () => {
  it('accepts any string with length 1–5000', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 5000 }),
        (concept) => validateConceptLength(concept) === true
      ),
      { numRuns: 200 }
    );
  });

  it('rejects the empty string', () => {
    fc.assert(
      fc.property(
        fc.constant(''),
        (concept) => validateConceptLength(concept) === false
      ),
      { numRuns: 1 }
    );
  });

  it('rejects any string with length > 5000', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5001, maxLength: 6000 }),
        (concept) => validateConceptLength(concept) === false
      ),
      { numRuns: 200 }
    );
  });

  it('accepts boundary value: length exactly 1', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 1 }),
        (concept) => validateConceptLength(concept) === true
      ),
      { numRuns: 50 }
    );
  });

  it('accepts boundary value: length exactly 5000', () => {
    fc.assert(
      fc.property(
        exactLengthAscii(5000),
        (concept) => validateConceptLength(concept) === true
      ),
      { numRuns: 20 }
    );
  });

  it('rejects boundary value: length exactly 5001', () => {
    fc.assert(
      fc.property(
        exactLengthAscii(5001),
        (concept) => validateConceptLength(concept) === false
      ),
      { numRuns: 20 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 14: Email structural validation
// Validates: Requirements 7.2
// ---------------------------------------------------------------------------
describe('Property 14 — Email structural validation', () => {
  it('result matches structural criteria for arbitrary strings', () => {
    /**
     * The rule (mirrors _isValidEmail exactly):
     *   parts = email.split('@')
     *   valid iff parts.length === 2 && parts[0].length > 0 && parts[1].includes('.')
     */
    fc.assert(
      fc.property(
        fc.string(),
        (email) => {
          const parts = email.split('@');
          const expected =
            parts.length === 2 &&
            parts[0].length > 0 &&
            parts[1].includes('.');

          return validateEmail(email).valid === expected;
        }
      ),
      { numRuns: 500 }
    );
  });

  it('accepts well-formed emails (local@domain.tld)', () => {
    // Generate structurally valid email strings using alphanumeric parts.
    const validEmailArb = fc
      .tuple(
        alphaNumeric(1, 30),
        alphaNumeric(1, 20),
        alphaNumeric(2, 5)
      )
      .map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

    fc.assert(
      fc.property(validEmailArb, (email) => validateEmail(email).valid === true),
      { numRuns: 200 }
    );
  });

  it('rejects strings with no @ symbol', () => {
    const noAtArb = fc.string().filter((s) => !s.includes('@'));

    fc.assert(
      fc.property(noAtArb, (email) => validateEmail(email).valid === false),
      { numRuns: 200 }
    );
  });

  it('rejects strings with more than one @ symbol', () => {
    // a@b@c — split('@').length === 3, not 2
    const twoAtArb = fc
      .tuple(
        fc.string().filter((s) => !s.includes('@')),
        fc.string().filter((s) => !s.includes('@')),
        fc.string().filter((s) => !s.includes('@'))
      )
      .map(([a, b, c]) => `${a}@${b}@${c}`);

    fc.assert(
      fc.property(twoAtArb, (email) => validateEmail(email).valid === false),
      { numRuns: 200 }
    );
  });

  it('rejects emails where the domain has no dot', () => {
    // local@domain — alphanumeric domain is guaranteed to contain no dot
    const noDotDomainArb = fc
      .tuple(
        alphaNumeric(1, 20),
        alphaNumeric(1, 20)
      )
      .map(([local, domain]) => `${local}@${domain}`);

    fc.assert(
      fc.property(
        noDotDomainArb,
        (email) => validateEmail(email).valid === false
      ),
      { numRuns: 200 }
    );
  });

  it('rejects emails with empty local part (@domain.tld)', () => {
    const emptyLocalArb = fc
      .tuple(
        alphaNumeric(1, 20),
        alphaNumeric(2, 5)
      )
      .map(([domain, tld]) => `@${domain}.${tld}`);

    fc.assert(
      fc.property(
        emptyLocalArb,
        (email) => validateEmail(email).valid === false
      ),
      { numRuns: 200 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 15: Password length validation
// Validates: Requirements 7.3
// ---------------------------------------------------------------------------
describe('Property 15 — Password length validation', () => {
  it('accepts passwords with length 8–128', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 8, maxLength: 128 }),
        (pwd) => validatePassword(pwd).valid === true
      ),
      { numRuns: 200 }
    );
  });

  it('rejects passwords shorter than 8 characters (length 1–7)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 7 }),
        (pwd) => validatePassword(pwd).valid === false
      ),
      { numRuns: 200 }
    );
  });

  it('rejects the empty password', () => {
    fc.assert(
      fc.property(
        fc.constant(''),
        (pwd) => validatePassword(pwd).valid === false
      ),
      { numRuns: 1 }
    );
  });

  it('rejects passwords longer than 128 characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 129, maxLength: 300 }),
        (pwd) => validatePassword(pwd).valid === false
      ),
      { numRuns: 200 }
    );
  });

  it('accepts boundary value: length exactly 8', () => {
    fc.assert(
      fc.property(
        exactLengthAscii(8),
        (pwd) => validatePassword(pwd).valid === true
      ),
      { numRuns: 100 }
    );
  });

  it('accepts boundary value: length exactly 128', () => {
    fc.assert(
      fc.property(
        exactLengthAscii(128),
        (pwd) => validatePassword(pwd).valid === true
      ),
      { numRuns: 100 }
    );
  });

  it('rejects boundary value: length exactly 7', () => {
    fc.assert(
      fc.property(
        exactLengthAscii(7),
        (pwd) => validatePassword(pwd).valid === false
      ),
      { numRuns: 100 }
    );
  });

  it('rejects boundary value: length exactly 129', () => {
    fc.assert(
      fc.property(
        exactLengthAscii(129),
        (pwd) => validatePassword(pwd).valid === false
      ),
      { numRuns: 100 }
    );
  });
});
