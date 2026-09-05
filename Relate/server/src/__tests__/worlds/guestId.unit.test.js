'use strict';

/**
 * Unit tests for server/src/middleware/guestId.middleware.js
 *
 * Property 38: Guest_ID cookie persists across browser open/close
 *              (Max-Age, not a session cookie)
 * Validates: Requirements 6.3, 6.10
 *
 * Mocking strategy: synthetic req/res objects via vi.fn() — no Supertest or
 * MongoDB required.  The real middleware module is required directly so we
 * exercise actual logic.
 */

const guestIdMiddleware = require('../../middleware/guestId.middleware.js');
const config = require('../../config/env.js');

// UUID v4 pattern
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Build a minimal mock req object.
 * @param {string|undefined} existingGuestId - value of the guestId cookie, if any
 */
function makeReq(existingGuestId) {
  return {
    cookies: existingGuestId !== undefined ? { guestId: existingGuestId } : {},
  };
}

/**
 * Build a minimal mock res object with a spy on `cookie`.
 */
function makeRes() {
  return {
    cookie: vi.fn(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Absent cookie behaviour
// ─────────────────────────────────────────────────────────────────────────────
describe('guestIdMiddleware — absent guestId cookie', () => {
  it('calls next()', () => {
    const req = makeReq(undefined);
    const res = makeRes();
    const next = vi.fn();

    guestIdMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('sets req.guestId to a new UUID', () => {
    const req = makeReq(undefined);
    const res = makeRes();
    const next = vi.fn();

    guestIdMiddleware(req, res, next);

    expect(typeof req.guestId).toBe('string');
    expect(req.guestId).toMatch(UUID_RE);
  });

  it('calls res.cookie to set the guestId cookie', () => {
    const req = makeReq(undefined);
    const res = makeRes();
    const next = vi.fn();

    guestIdMiddleware(req, res, next);

    expect(res.cookie).toHaveBeenCalledTimes(1);
  });

  it('sets the cookie name to "guestId"', () => {
    const req = makeReq(undefined);
    const res = makeRes();
    const next = vi.fn();

    guestIdMiddleware(req, res, next);

    const [name] = res.cookie.mock.calls[0];
    expect(name).toBe('guestId');
  });

  it('cookie value matches req.guestId', () => {
    const req = makeReq(undefined);
    const res = makeRes();
    const next = vi.fn();

    guestIdMiddleware(req, res, next);

    const [, value] = res.cookie.mock.calls[0];
    expect(value).toBe(req.guestId);
  });

  it('cookie has HttpOnly attribute (Property 38 — not readable from JS)', () => {
    const req = makeReq(undefined);
    const res = makeRes();
    const next = vi.fn();

    guestIdMiddleware(req, res, next);

    const [, , options] = res.cookie.mock.calls[0];
    expect(options.httpOnly).toBe(true);
  });

  it('cookie has SameSite=Strict attribute', () => {
    const req = makeReq(undefined);
    const res = makeRes();
    const next = vi.fn();

    guestIdMiddleware(req, res, next);

    const [, , options] = res.cookie.mock.calls[0];
    expect(options.sameSite).toBe('Strict');
  });

  it('cookie has Max-Age from config — persistent, not a session cookie (Property 38)', () => {
    const req = makeReq(undefined);
    const res = makeRes();
    const next = vi.fn();

    guestIdMiddleware(req, res, next);

    const [, , options] = res.cookie.mock.calls[0];

    // Max-Age must be present (non-zero, positive number) — this makes it
    // persistent across browser close/open rather than a session cookie.
    expect(options.maxAge).toBeDefined();
    expect(typeof options.maxAge).toBe('number');
    expect(options.maxAge).toBeGreaterThan(0);
  });

  it('Max-Age equals config.guestCookieMaxAgeMs (default 30 days = 2592000000 ms)', () => {
    const req = makeReq(undefined);
    const res = makeRes();
    const next = vi.fn();

    guestIdMiddleware(req, res, next);

    const [, , options] = res.cookie.mock.calls[0];
    expect(options.maxAge).toBe(config.guestCookieMaxAgeMs);
  });

  it('generated guestId is a valid UUID v4-format string', () => {
    const req = makeReq(undefined);
    const res = makeRes();
    const next = vi.fn();

    guestIdMiddleware(req, res, next);

    expect(req.guestId).toMatch(UUID_RE);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Present cookie behaviour
// ─────────────────────────────────────────────────────────────────────────────
describe('guestIdMiddleware — present guestId cookie', () => {
  const EXISTING_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

  it('calls next()', () => {
    const req = makeReq(EXISTING_ID);
    const res = makeRes();
    const next = vi.fn();

    guestIdMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('sets req.guestId to the existing cookie value', () => {
    const req = makeReq(EXISTING_ID);
    const res = makeRes();
    const next = vi.fn();

    guestIdMiddleware(req, res, next);

    expect(req.guestId).toBe(EXISTING_ID);
  });

  it('does NOT call res.cookie (existing value is reused — no new cookie set)', () => {
    const req = makeReq(EXISTING_ID);
    const res = makeRes();
    const next = vi.fn();

    guestIdMiddleware(req, res, next);

    expect(res.cookie).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Edge case: empty cookies object (no guestId key)
// ─────────────────────────────────────────────────────────────────────────────
describe('guestIdMiddleware — empty cookies object', () => {
  it('generates a new UUID when cookies object exists but has no guestId key', () => {
    const req = { cookies: {} }; // cookies present but empty
    const res = makeRes();
    const next = vi.fn();

    guestIdMiddleware(req, res, next);

    expect(req.guestId).toMatch(UUID_RE);
    expect(res.cookie).toHaveBeenCalledTimes(1);
  });
});
