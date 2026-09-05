# Implementation Plan: Relate

## Overview

Full-stack implementation of the Relate application — a React + Vite SPA backed by a Node.js/Express API, MongoDB database, and a provider-agnostic AI service. Tasks are ordered so each step integrates into the previous one: server foundation first, then AI service, then auth, then core analogy flows, then library, then practice mode, and finally frontend wiring. No hanging or orphaned code is produced at any step.

---

## Tasks

- [x] 1. Server foundation and environment configuration
  - [x] 1.1 Initialise the `server/` package, install dependencies (`express`, `mongoose`, `dotenv`, `cookie-parser`, `cors`, `bcrypt`, `jsonwebtoken`, `express-rate-limit`, `nodemailer`), and create `server/src/config/env.js` that validates all required environment variables at startup and exports the config object; process exits with a descriptive error if any required variable is missing
    - Required vars: `MONGODB_URI`, `JWT_SECRET`, `LLM_PROVIDER`, `LLM_API_KEY`, `LLM_MODEL`, `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`, `CLIENT_ORIGIN`
    - Configurable limits exported: `practiceQuestionCount`, `aiAnalogyTimeoutMs`, `aiPracticeQuestionsTimeoutMs`, `aiPracticeEvaluationTimeoutMs`, `aiMaxRetries`, `guestCookieMaxAgeMs`
    - Partial secret values are NEVER logged; only variable names are logged
    - Create `.env.example` with all required variable names and placeholder values
    - Add `.gitignore` at the project root with the pattern `.env .env.*` to cover `.env`, `.env.local`, `.env.production`, `.env.development`, etc.
    - _Requirements: 2.15, 2.16_ (env startup validation + provider-agnostic config)

 - [x] 1.2 Create `server/src/config/worlds.js` (Analogy_World_List array) and `server/src/config/practice.js` (PRACTICE_QUESTION_COUNT, timeouts, max retries); create the Express app entry point with `cookie-parser`, CORS (origin from `CLIENT_ORIGIN`), JSON body parsing, and MongoDB connection via `MONGODB_URI`
    - _Requirements: 1.8_

  - [x] 1.3 Create all five Mongoose models: `User.model.js`, `Analogy.model.js` (with `AnalogyNode`, `AnalogyMapping`, `AnalogyRelationship` subdocuments), `PracticeSession.model.js`, `GuestUsage.model.js`, `ResetToken.model.js` — including all indexes, TTL indexes, and pre-save hooks exactly as specified in the design
    - `User`: unique email index, `updatedAt` pre-save hook, no `confirmPassword` field
    - `GuestUsage`: TTL index on `expiresAt` (90 days), index on `guestId`
    - `Analogy`: index on `userId`, `updatedAt` pre-save hook
    - `PracticeSession`: compound index `{ userId, analogyId, completedAt: -1 }` and `{ userId, completedAt: -1 }`
    - `ResetToken`: TTL index on `expiresAt`, index on `tokenHash`
    - _Requirements: 7.7, 7.8, 8.3, 12.2, 12.3_

  - [ ]* 1.4 Write unit tests for `env.js` startup validation — missing variable causes `process.exit(1)`, present variables export correctly; write unit tests for all Mongoose model schema shapes (required fields, defaults, indexes)
    - _Requirements: 2.15_

- [x] 2. Request validation, sanitization, and rate-limiting middleware
  - [x] 2.1 Create `server/src/middleware/validate.middleware.js` with per-endpoint schema validators; create a sanitizer that strips MongoDB operator injection (`$`, `.` in key positions) and HTML tags from `name`/`email` fields while preserving legitimate punctuation in `concept` text
    - _Requirements: 1.1, 1.4, 1.5, 7.2, 7.3, 7.4, 7.5, 13.3_

  - [x] 2.2 Create `server/src/middleware/rateLimiter.js` using `express-rate-limit` with the six rate-limit configs from the design (analogy generation, practice questions, practice questions/more, practice evaluate, login, forgot-password); rate-limit exceeded response: `{ error: { code: "RATE_LIMIT_EXCEEDED", message: "..." } }`
    - Keys: IP for guests and login/forgot; `userId` for authenticated practice endpoints
    - _Requirements: 2.9, 10.19_

  - [ ]* 2.3 Write unit tests for the sanitizer (strips `$where`, strips HTML from name, preserves apostrophes/question marks in concept text); write unit tests for each validator schema (concept empty → error, concept 5001 chars → error, missing email → error, password 7 chars → error)
    - **Property 2: Concept length validation at both frontend and backend**
    - **Property 14: Email validation accepts iff structural criteria are met**
    - **Property 15: Password validation accepts iff length in [8, 128]**
    - **Validates: Requirements 1.1, 1.4, 1.5, 7.2, 7.3, 13.3**

  - [x] 2.4 Write property tests for concept length validation and email/password validators
    - **Property 2: Concept accepts 1–5000 chars; empty and >5000 rejected**
    - **Property 14: Email accepts iff `@` present with non-empty local and domain with `.`**
    - **Property 15: Password accepts iff length in [8, 128]**
    - **Validates: Requirements 1.1, 7.2, 7.3, 13.3**

- [~] 3. AI service — provider abstraction, validators, and prompts
  - [x] 3.1 Create `server/src/services/ai/providers/index.js` (resolves provider from `LLM_PROVIDER` env), `server/src/services/ai/providers/groq.provider.js` (implements `call(prompt, timeoutMs)` returning raw string), and `server/src/services/ai/aiService.js` facade with retry/timeout logic as specified in the design (3 total attempts, per-operation timeouts); raw provider errors are caught and sanitized — never forwarded to frontend
   - `LLM_PROVIDER` must match a registered key in `providers/index.js`
  - `OxAlpha` is the configured LLM provider for this implementation
  - The Groq API key is read only from `LLM_API_KEY` and is never included in any API response or client-side code
  - The model identifier is read from `LLM_MODEL`
  - Retry/timeout table: analogy generation 30 000 ms / 2 retries; practice questions 15 000 ms / 2 retries; practice evaluation 15 000 ms / 2 retries; meaningfulness 15 000 ms / 1 retry
    - _Requirements: 2.9, 2.10, 2.11, 2.15, 2.16_

  - [x] 3.2 Create all nine prompt template files under `server/src/services/ai/prompts/` (`generate`, `simplify`, `expand`, `regenerate`, `switchWorld`, `practiceQuestions`, `practiceEvaluate`, `generateMoreQuestions`, `meaningfulness`) with the exact template strings from the design document
    - `generate.prompt.js`: `analogyTitle` rule — MUST be concept-focused, MUST NOT include Analogy_World name
    - `meaningfulness.prompt.js`: semantic evaluation, no hardcoded blacklist
    - _Requirements: 2.2, 2.6, 2.7, 4.3, 5.10, 17.2, 17.3_

  - [x] 3.3 Create `server/src/services/ai/validators/aiResponse.validator.js`, `practiceQuestions.validator.js`, and `practiceEvaluation.validator.js` with the exact validation logic from the design; create `server/src/services/ai/meaningfulnessValidator.js` as an isolated module
    - `validateAIResponse`: validates the complete AI_Response schema exactly as defined in the design, including non-empty `analogyTitle`, valid `nodes` count [3,20], valid mappings, valid relationships, non-empty `explanation`, and `limitations` count [1,10]; all required fields and nested structures must be validated. Relationship validation must also enforce: each relationship's `sourceId` and `targetId` reference existing node IDs from the `nodes` array; `sourceId` and `targetId` must be distinct (self-loops rejected); `label` (if present) must be a string or null; `flow` (if present) must be a boolean
    - `validatePracticeQuestions`: array [1,5], each question has required fields, MCQ has options [2,6] with exactly 1 `isCorrect: true`; each `mappingLabel` must be a non-empty string
    - `validatePracticeEvaluation`: `correct` boolean, required string fields, `misconception` string or null
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.8, 2.13, 10.10, 10.14_

  - [ ]* 3.4 Write unit tests for all three AI validators and the meaningfulness validator; write unit tests for `aiService.js` retry logic (mock provider fails twice, succeeds on third → returns result; all three fail → 503); write unit tests for each prompt template (template substitution produces expected strings)
    - _Requirements: 2.8, 2.9, 2.10_

  - [ ]* 3.5 Write property tests for the AI response validator and practice question validator
    - **Property 6: `validateAIResponse` enforces all structural constraints**
    - **Property 9: Node count outside [3,20] is rejected**
    - **Property 11: Limitations count in [1,10]**
    - **Property 21: Practice question count in [1,5]**
    - **Property 23: MCQ options [2,6] with exactly 1 correct**
    - The Property 6 test must use arbitraries that generate valid `sourceId`/`targetId` values referencing only existing node IDs (referential integrity); additionally include a test that any relationship referencing a non-existent node ID is rejected by `validateAIResponse`
    - **Validates: Requirements 2.8, 2.13, 3.9, 4.4, 10.7, 10.10**

- [x] 4. Auth routes, controllers, and token service
  - [x] 4.1 Create `server/src/services/token.service.js` (`crypto.randomBytes(32)` generation, SHA-256 hashing); create `server/src/middleware/auth.middleware.js` (`requireAuth`: reads `token` cookie, verifies JWT, sets `req.user = { userId, email }` from JWT claims only — never from request body)
    - JWT cookie attributes: `httpOnly: true`, `secure: true` in production, `sameSite: 'Strict'`, `maxAge: 7 * 24 * 60 * 60 * 1000`
    - _Requirements: 7.18, 16.16_

  - [x] 4.2 Create `server/src/routes/auth.routes.js` and `server/src/controllers/auth.controller.js` implementing all six auth endpoints: `POST /register`, `POST /login`, `POST /logout`, `GET /me`, `POST /forgot-password`, `POST /reset-password`
    - Registration: hash password with bcrypt (rounds 12), never store `confirmPassword`, optional `guestAnalogy` transferred (validated against `validateAIResponse` before saving — rejected if invalid, registration still succeeds if save fails)
    - Login: generic 401 message (no email/password distinction)
    - Forgot-password: always 200 (enumeration-safe); generates plaintext token → stores only `tokenHash`
    - Reset-password: SHA-256 lookup, validates not expired/not used; on success marks `used: true` and updates `passwordHash`
    - _Requirements: 7.1–7.22, 16.11–16.16_

  - [ ]* 4.3 Write unit tests for `token.service.js` (same plaintext → same hash, different plaintexts → different hashes, `randomBytes(32)` produces 64-char hex); write unit tests for `auth.middleware.js` (valid JWT → sets `req.user`; expired JWT → 401; absent cookie → 401; tampered signature → 401)
    - _Requirements: 7.18_

  - [ ]* 4.4 Write property tests for password validation and confirm-password field exclusion
    - **Property 15: Password accepts iff length in [8, 128]**
    - **Property 16: `confirmPassword` never stored — User schema has no such field**
    - **Validates: Requirements 7.3, 7.8, 16.11**

  - [x] 4.5 Write integration tests for all six auth endpoints using Supertest + MongoDB Memory Server
    - `POST /register` → 201 + cookie; duplicate email → 400; invalid password → 400
    - `POST /login` valid → 200 + cookie; invalid credentials → 401 generic message
    - `GET /me` with valid cookie → 200; without cookie → 401
    - `POST /forgot-password` → always 200; valid email creates `ResetToken` with `tokenHash` (not plaintext)
    - `POST /reset-password` valid → 200, `passwordHash` updated, token marked `used: true`; used token → 400; expired token → 400
    - _Requirements: 7.1–7.22, 16.11–16.16_

- [x] 5. Checkpoint — auth layer complete
  - Ensure all auth unit and integration tests pass; confirm JWT cookie is set on register and login responses; confirm `confirmPassword` is absent from User documents in DB; confirm `tokenHash` stored (not plaintext) in `ResetToken` documents.

- [x] 6. Worlds endpoint and guest middleware
  - [x] 6.1 Create `server/src/routes/worlds.routes.js` returning `{ worlds: string[] }` from `config/worlds.js`; create guest-ID middleware that reads `guestId` cookie — if absent, generates a UUID and sets `Set-Cookie: guestId=<uuid>; HttpOnly; SameSite=Strict; Max-Age=<guestCookieMaxAgeMs>` — applied globally before all routes
    - Guest_ID cookie: `HttpOnly`, `SameSite=Strict`, `Max-Age` from config (30 days default)
    - _Requirements: 1.8, 6.3, 6.10_

  - [x] 6.2 Write integration tests for `GET /api/worlds` (returns worlds array, no auth required); write unit test for guest-ID middleware (absent cookie → sets cookie; present cookie → uses existing value)
    - **Property 1: Analogy_World selector reflects backend API data exactly**
    - **Property 38: Guest_ID cookie persists across browser open/close (Max-Age, not session)**
    - **Validates: Requirements 1.3, 1.8, 6.3, 6.10**

- [x] 7. Analogy generation and modification routes
  - [x] 7.1 Create `server/src/routes/analogy.routes.js` and `server/src/controllers/analogy.controller.js` implementing `POST /api/analogies/generate` with the following exact flow:
    - Step 1: Apply rate limiter (IP for unauthenticated; `userId` for authenticated)
    - Step 2: Schema validate + sanitize request body
    - Step 3: Call `MeaningfulnessValidator.validate(concept)` — if `valid: false` → return `400 MEANINGFULNESS_REJECTED`; Guest_ID is NOT consumed; AI_Service is NOT called
    - Step 4: Call `AIService.generate()` (30s timeout, up to 2 retries) — if all attempts fail → return `503 AI_FAILURE`; Guest_ID is NOT consumed
    - Step 5 (unauthenticated requests only): Query `GuestUsage.findOne({ guestId })` — if `consumed = true` → return `403 GUEST_LIMIT_REACHED`, discard the generated analogy (do not return it to the Frontend); if `consumed = false` or record not found → use `findOneAndUpdate` with upsert to atomically mark `consumed = true` and store `analogyData`, then return `200 { analogy }`
    - The atomic mark-consumed step uses `findOneAndUpdate` semantics to prevent race conditions when concurrent requests arrive after AI generation succeeds; pre-AI reservation is NOT used
    - If the guest opportunity has already been consumed, return `403 GUEST_LIMIT_REACHED` and do NOT return the generated analogy
    - `req.user.userId` comes exclusively from verified JWT — never from request body
    - AI failures return `503 { code: "AI_FAILURE" }` after all retries
    - _Requirements: 2.1–2.16, 6.2–6.6, 6.14_

  - [x] 7.2 Implement the remaining analogy CRUD endpoints in `analogy.controller.js`: `POST /api/analogies` (save, auth required, returns `201 { analogy: { id, analogyTitle, concept, analogyWorld, createdAt } }`), `GET /api/analogies/:id` (auth + ownership; after retrieving from DB, re-run `validateAIResponse` on the deserialized document before returning — if validation fails return `500 INTERNAL_ERROR`), `PUT /api/analogies/:id` (auth + ownership, overwrites), `DELETE /api/analogies/:id` (auth + ownership), `POST /api/analogies/:id/modify` (auth + ownership; passes `modificationType`, `currentNodeCount`, `previousNodeLabels` to AI_Service)
    - All ownership checks compare `analogy.userId.equals(req.user.userId)` → 403 if mismatch
    - Modification-specific AI inputs:
  - `simplify`: `modificationType`, `currentNodeCount`
  - `expand`: `modificationType`, `currentNodeCount`
  - `regenerate`: `modificationType`, `currentNodeCount`, `previousNodeLabels`
  - `switchWorld`: `modificationType`, `analogyWorld` (the NEW world — from the request body), and `previousAnalogyWorld` (retrieved from the stored analogy document server-side — NOT trusted from the client request body)
    - _Requirements: 5.1–5.10, 8.1–8.9_

  - [ ]* 7.3 Write unit tests for `analogy.controller.js` — meaningfulness check called before AI; `MEANINGFULNESS_REJECTED` returned when validator returns `valid: false`; `AI_SERVICE` not called when meaningfulness invalid; `GUEST_LIMIT_REACHED` returned when guest `consumed: true`
    - **Property 3: Meaningfulness check always precedes full AI generation**
    - **Property 4: Meaningfulness validator returns structured data for all inputs**
    - **Property 5: Invalid meaningfulness result prevents AI call**
    - **Property 39: Backend rejects guest's second generation attempt**
    - **Validates: Requirements 2.1, 2.3, 6.5, 6.14**

  - [ ]* 7.4 Write property tests for analogy title and node count constraints
    - **Property 7: `analogyTitle` is concept-focused, never includes Analogy_World name**
    - **Property 34: Concept max 5,000 characters enforced at backend**
    - **Validates: Requirements 2.13, 5.10, 13.3, 17.2, 17.3**

  - [x] 7.5 Write integration tests for analogy endpoints using Supertest + MongoDB Memory Server
    - `POST /api/analogies/generate` (no cookie) → Backend sets `guestId` cookie + returns analogy (mock AI)
    - `POST /api/analogies/generate` (consumed `guestId`) → `403 GUEST_LIMIT_REACHED`
    - `POST /api/analogies/generate` with meaningless concept → `400 MEANINGFULNESS_REJECTED` (mock validator)
    - `POST /api/analogies` (auth) → `201` + returns `{ analogy: { id, analogyTitle, concept, analogyWorld, createdAt } }`
    - `GET /api/analogies/:id` (owner) → `200`; (non-owner) → `403`
    - `GET /api/analogies/:id` with corrupted stored data (fails `validateAIResponse`) → `500 INTERNAL_ERROR`
    - `PUT /api/analogies/:id` (owner) → `200`, `updatedAt` updated
    - `DELETE /api/analogies/:id` (owner) → `200`; (non-owner) → `403`
    - `POST /api/analogies/:id/modify` (auth, mock AI) → `200 { analogy }`
    - _Requirements: 2.1–2.16, 5.1–5.10, 6.2–6.14, 8.1–8.9_

- [x] 8. Library endpoint
  - [x] 8.1 Create `server/src/routes/library.routes.js` and `server/src/controllers/library.controller.js` implementing `GET /api/library` (auth required): returns all analogies for `req.user.userId` ordered by `createdAt` descending; each item includes `id`, `analogyTitle`, `concept` (full text), `analogyWorld`, `createdAt`, `previewNodes` (first 3–4 nodes only)
    - `401` if token absent/invalid; `500` if DB fails
    - _Requirements: 9.1–9.12_

  - [ ]* 8.2 Write integration tests for `GET /api/library` — auth required (→ `401` without cookie); returns only the authenticated user's analogies; ordered newest first; `previewNodes` contains max 4 nodes
    - _Requirements: 9.2, 9.3, 9.11_

- [x] 9. Practice routes and controllers
  - [x] 9.1 Create `server/src/routes/practice.routes.js` and `server/src/controllers/practice.controller.js` implementing `POST /api/practice/questions` and `POST /api/practice/questions/more`.
    - Both endpoints require auth and an `analogyId`
    - Backend verifies ownership of the saved analogy and retrieves the full analogy context from MongoDB
    - The Backend passes the stored analogy context to `AIService.generatePracticeQuestions()`
    - The client MUST NOT be trusted as the source of truth for the analogy's nodes, mappings, relationships, explanation, or limitations
    - `/more` additionally passes the `previousQuestions` array so the AI generates non-duplicate questions
    - After AI returns practice questions, the controller must verify that each `question.mappingLabel` exists in the analogy's stored `mappings` array (exact match against `mappingLabel` values); if any question's `mappingLabel` does not match, treat the response as a validation failure and retry (up to the configured max retries); return `503 AI_FAILURE` if all retries are exhausted
    - Timeout: 15 000 ms; retries: 2; `503 AI_FAILURE` after all retries
    - _Requirements: 10.6, 10.7, 10.8, 10.9, 10.10, 10.21_

  - [x] 9.2 Implement `POST /api/practice/evaluate` (auth required): validates request, calls `AIService.evaluateAnswer()` (15 000 ms timeout, 2 retries); returns `200 { evaluation: PracticeEvaluation }` or `503 AI_FAILURE`
    - _Requirements: 10.13, 10.14, 10.19_

  - [x] 9.3 Implement `POST /api/practice/sessions` (auth required): creates a new `PracticeSession` document — NEVER uses `findOneAndUpdate`; stores complete `questions`, `answers`, `evaluations` arrays; returns `201 { sessionId }`; implement `GET /api/practice/sessions/:analogyId` (auth, ordered `completedAt` desc, max 50 results) and `GET /api/practice/sessions/:analogyId/:sessionId` (auth + ownership → `403` if mismatch); implement `GET /api/practice/history` (auth required): returns summary records for ALL of the authenticated user's practice sessions across all analogies, ordered by `completedAt` descending (summary data only — no per-question detail); used by `PracticeHistoryPage`
    - Session ownership: `session.userId.equals(req.user.userId)`
    - _Requirements: 10.6, 12.1–12.9_

  - [ ]* 9.4 Write unit tests for practice controller: unauthenticated request → `401`; session saved with `PracticeSession.create()` not `findOneAndUpdate`; second save for same analogy creates new document (different `sessionId`); session ownership mismatch → `403`; practice controller mappingLabel cross-reference — question returned by AI with a `mappingLabel` not found in the analogy's stored `mappings` array → treated as validation failure (retry / 503, not a 200 response)
    - **Property 29: Session stored with full questions and evaluations**
    - **Property 30: Session never overwritten; each attempt creates new record**
    - **Property 32: Practice history access requires valid authentication**
    - **Property 40: Guests cannot access Practice Mode**
    - **Validates: Requirements 10.5, 10.10, 12.2, 12.3, 12.9_**

  - [ ]* 9.5 Write property tests for practice score calculation
    - **Property 33: Score = Math.round(correct / total * 100)**
    - **Property 27: Practice evaluation timeout is 15 seconds**
    - **Validates: Requirements 12.1**

  - [x] 9.6 Write integration tests for practice endpoints using Supertest + MongoDB Memory Server
    - `POST /api/practice/questions` without auth → `401`
    - `POST /api/practice/questions` (auth, mock AI) → `200 { questions }`
    - `POST /api/practice/evaluate` (auth, mock AI) → `200 { evaluation }`
    - `POST /api/practice/sessions` (auth) → `201 { sessionId }`, new DB record
    - `POST /api/practice/sessions` again (same analogy) → `201` + different `sessionId`
    - `GET /api/practice/sessions/:analogyId` (auth) → sessions ordered newest first
    - `GET /api/practice/sessions/:analogyId/:sessionId` (auth, owner) → `200` + full session
    - `GET /api/practice/sessions/:analogyId/:sessionId` (non-owner) → `403`
    - `POST /api/practice/questions/more` includes `previousQuestions` in AI prompt (verify via mock)
    - `GET /api/practice/history` (auth) → `200` + returns all sessions for the authenticated user ordered newest first
    - `GET /api/practice/history` without auth → `401`
    - _Requirements: 10.5–10.21, 12.1–12.9_

- [x] 10. Email service and password reset wiring
  - [x] 10.1 Create `server/src/services/email/email.service.js` using Nodemailer (SMTP config from `env.js`); implement `sendPasswordResetEmail({ to, resetUrl })` that composes and sends the reset email; the plaintext token appears only in the email URL — never logged or stored
    - _Requirements: 16.12, 16.13, 16.16_

  - [ ]* 10.2 Write unit tests for `email.service.js` (mock Nodemailer transport, verify `to` and `resetUrl` passed correctly); write unit tests for full password reset flow in `auth.controller.js` — `ResetToken` created with `tokenHash` (not plaintext); used token → `400 RESET_TOKEN_INVALID`; expired token → `400 RESET_TOKEN_INVALID`; valid token → `200`, `passwordHash` updated
    - **Property 36: Reset_Token stored as hash only, plaintext never persisted**
    - **Property 37: Invalid/expired/used Reset_Token returns specific error with new-request link**
    - **Validates: Requirements 16.13, 16.16**

- [x] 11. Checkpoint — backend complete
  - Ensure all server-side unit, property, and integration tests pass. Verify `POST /api/analogies/generate`, all auth flows, library, and practice endpoints work end-to-end with a real (in-memory) MongoDB instance and mocked AI/email services.

- [x] 12. Client project setup and global infrastructure
  - [x] 12.1 Initialise the `client/` package with Vite + React; install dependencies (`react-router-dom`, `reactflow`, `dagre`, `axios`); configure `vite.config.js` with a `/api` proxy to `http://localhost:5000`; create the directory structure matching the design (`api/`, `components/`, `pages/`, `hooks/`, `context/`, `utils/`)
    - _Requirements: 3.10_

  - [x] 12.2 Create `client/src/utils/dagre.js` (`applyDagreLayout(nodes, edges, direction)` using `dagre.graphlib.Graph` with `nodesep: 60, ranksep: 80`, node size `180 × 60`); create `client/src/utils/truncate.js` (`truncate(str, maxLen)` → str + ellipsis if over limit); create `client/src/utils/guestSession.js` (`get`, `set`, `clear` for `sessionStorage["guestAnalogy"]`)
    - `applyDagreLayout` must NOT store positions to DB — positions are computed at render time only
    - _Requirements: 3.11, 3.12, 9.4_

  - [ ]* 12.3 Write unit tests for `dagre.js` (returned node count = input count; all nodes have non-zero positions; edge count unchanged); write unit tests for `truncate.js` (≤60 chars unchanged; >60 chars truncated + ellipsis); write unit tests for `guestSession.js` (`set` then `get` returns same object; `clear` returns null)
    - **Property 8: Node display labels truncated at 60 characters**
    - **Property 17: Library card concept truncated at 100 characters**
    - **Validates: Requirements 3.2, 9.4**

  - [ ]* 12.4 Write property tests for the truncate utility
    - **Property 8: `truncate(str, 60).length <= 60` for any string input**
    - **Property 17: `truncate(str, 100).length <= 100` for any string input**
    - **Validates: Requirements 3.2, 9.4**

- [x] 13. Auth context, hooks, and API wrappers
  - [x] 13.1 Create `client/src/api/auth.api.js` (Axios wrappers for all six auth endpoints, `withCredentials: true`); create `client/src/context/AuthContext.jsx` (`user`, `loading` state; `login()`, `logout()` actions; `GET /api/auth/me` on mount to rehydrate user state; `user: null` on `401`)
    - _Requirements: 7.14–7.22_

  - [x] 13.2 Create `client/src/hooks/useAuth.js` (reads `AuthContext`); create `client/src/components/layout/ProtectedRoute.jsx` (shows `<LoadingSpinner />` while `loading`; redirects to `/login?from=<currentPath>` if `user === null`); create `client/src/components/layout/GuestRoute.jsx`
  -- `GuestRoute.jsx`: prevents authenticated users from accessing guest-only auth pages such as `/login`, `/register`, `/forgot-password`, and `/reset-password`; redirects authenticated users to the appropriate authenticated landing page.
    - _Requirements: 7.20, 9.1, 10.5_

  - [x] 13.3 Create `client/src/api/analogy.api.js`, `library.api.js`, `practice.api.js`, `worlds.api.js` as Axios/fetch wrappers for all backend endpoints
    - _Requirements: 1.8, 8.2, 9.2, 10.6_

- [x] 14. Auth pages
  - [x] 14.1 Create `client/src/pages/LoginPage.jsx` and `client/src/pages/RegisterPage.jsx`: `LoginPage` — two fields (Email, Password), inline validation on empty fields, generic `401` message display, post-login check `useGuestSession().get()` → - After successful login, if `guestSession.get()` returns an analogy:
  - POST it to `/api/analogies`
  - on success, clear `guestSession` and navigate to `/library`
  - on save failure, retain `guestSession`, show a non-blocking error, and still navigate to `/library`; `RegisterPage` — four fields (Name, Email, Password, Confirm Password), client-side confirm-password match validation, `confirmPassword` NEVER sent to backend, includes `guestAnalogy` in registration payload if present in sessionStorage
    - _Requirements: 7.10–7.13, 7.22, 6.9_

  - [x] 14.2 Create `client/src/pages/ForgotPasswordPage.jsx` (single email field, always shows success message regardless of outcome) and `client/src/pages/ResetPasswordPage.jsx` (New Password + Confirm New Password fields, 8–128 char client validation, shows `RESET_TOKEN_INVALID` error with "Request a new reset link" button on `400`)
    - Security requirement: `ResetPasswordPage` must apply `Referrer-Policy: no-referrer` while the plaintext reset token is present in the URL (via a `<meta name="referrer" content="no-referrer">` tag or equivalent), so the token cannot leak through the HTTP `Referer` header to any third-party resource. The page must not load third-party resources that could receive the reset URL via the `Referer` header while the token is in the query string.
    - _Requirements: 16.11–16.16_

  - [x] 14.3 Write component tests for `LoginPage` (empty fields → inline errors; `401` → generic message; no email/password distinction) and `RegisterPage` (confirm password mismatch → "Passwords do not match."; `confirmPassword` not in submitted payload)
    - **Property 16: `confirmPassword` never stored — NEVER in payload sent to Backend**
    - **Validates: Requirements 7.8, 7.11, 7.12, 7.16**

- [x] 15. Analogy generation page and Visual Model
  - [x] 15.1 Create `client/src/hooks/useAnalogy.js` (state: `analogy`, `loading`, `modifying`, `error`; actions: `generate`, `modify`, `save`, `update`); create `client/src/hooks/useGuestSession.js` (wraps `utils/guestSession.js`; does NOT touch `guestId` cookie)
    - On `MEANINGFULNESS_REJECTED` (400) → set `error` to user-facing message, display on concept field
    - On `AI_FAILURE` (503) → set `error` for dismissible banner
    - On `GUEST_LIMIT_REACHED` (403) → set `error` for inline message with login/register links
    - _Requirements: 2.3, 2.10, 6.7, 6.8_

  - [x] 15.2 Create `client/src/components/analogy/ConceptForm.jsx` (text input 1–5000 chars, inline validation) and `client/src/components/analogy/WorldSelector.jsx` (fetches worlds from `GET /api/worlds` on mount via `worlds.api.js`, populates selector, inline validation on empty selection); wire both into `client/src/pages/HomePage.jsx` and `client/src/pages/AnalogyPage.jsx`
    - Frontend does NOT hardcode world names — always fetched from Backend
    - Empty concept → inline error, no submission; concept >5000 chars → inline error
    - Empty world → inline error, no submission
    - `AnalogyPage` renders a Save button for authenticated users with the following states: enabled when the analogy is unsaved or has been modified since last save; shows "Saved" / disabled after a successful save; shows an inline error with retry action on save failure; for a previously saved analogy that has been modified, the button reads "Save Updated Version" and calls `useAnalogy().update(id)`
    - _Requirements: 1.1–1.8, 8.1–8.9_

  - [x] 15.3 Create `client/src/components/analogy/AnalogyNode.jsx` (custom React Flow node, renders `conceptLabel` and `analogyLabel` each truncated to 60 chars via `truncate()`; receives the resolved world theme/presentation information via `data.analogyWorld`; applies world-aware visual treatment to the node); create `client/src/utils/worldThemes.js` (world-theme resolver that maps an Analogy_World string to a visual theme configuration object; provides a fallback theme for unsupported/new worlds; keeps visual configuration separate from AI data; avoids hardcoded rendering branches scattered throughout VisualModel.jsx); create `client/src/components/analogy/VisualModel.jsx` (receives `analogyWorld` as a prop alongside `nodes` and `relationships`; resolves the corresponding world theme using the worldThemes resolver; transforms AI_Response nodes → RF nodes with `type: 'analogyNode'` and `data: { conceptLabel, analogyLabel, analogyWorld }`; transforms relationships → RF edges with `markerEnd` for `flow: true` and no marker for `flow: false`; applies `applyDagreLayout`; renders `<ReactFlow>` with `fitView`; wraps in scrollable container on viewports <768px)
    - Positions computed at render time — NEVER stored in DB
    - Custom `nodeTypes` registered: `{ analogyNode: AnalogyNode }`
    - World-aware styling changes presentation only — does NOT modify underlying node/relationship data
    - React Flow's default node appearance is NOT used as the final design
    - World-specific presentation is centralized in the theme system (`worldThemes.js`) rather than scattered across components
    - Acceptance criteria: (1) Changing `analogyWorld` from one supported world to another visibly changes the Visual_Model presentation; (2) The same AI_Response can be rendered in multiple worlds without modifying the AI_Response data; (3) Unsupported/new world names render using the fallback Relate theme rather than crashing; (4) React Flow's default node appearance is not used as the final design; (5) World-specific presentation is centralized in the theme system rather than scattered across components; (6) Node labels remain readable and truncated at 60 characters; (7) Graph layout remains controlled by Dagre; (8) No node positions are persisted
    - _Requirements: 3.1–3.14_

  - [ ]* 15.4 Write component tests for `VisualModel` (correct number of RF nodes from mock AI_Response; correct number of RF edges; edges with `flow: true` have `arrowclosed` marker; edges with `flow: false` have no marker) and `ConceptForm` (empty concept → inline error; 5001-char concept → inline error; `MEANINGFULNESS_REJECTED` → inline error on concept field)
    - **Property 1: Analogy_World selector reflects backend API data exactly**
    - **Property 2: Concept length enforced at frontend**
    - **Validates: Requirements 1.3, 1.4, 1.5, 3.1, 3.4, 3.5**

  - [ ]* 15.5 Write property tests for node label truncation
    - **Property 8: `truncate(conceptLabel, 60).length <= 60` and `truncate(analogyLabel, 60).length <= 60` for any string**
    - **Validates: Requirements 3.2**

- [x] 16. Explanation, limitations, modification controls, and guest prompt
  - [x] 16.1 Create `client/src/components/analogy/ExplanationPanel.jsx` (renders `explanation` as formatted text; if absent shows error message, hides limitations), `client/src/components/analogy/LimitationsPanel.jsx` (renders each limitation as a separate list item with bullet/numbered marker under "Where This Analogy Breaks Down" heading); both display AI content from structured JSON fields — never raw JSON syntax visible to user
    - _Requirements: 4.1, 4.2, 4.5, 4.6_

  - [x] 16.2 Create `client/src/components/analogy/ModificationControls.jsx` (buttons: Simplify, More Detail, Regenerate, Switch World; disabled during modification; re-enabled on error; "Simplify" button disabled client-side when node count = 1 with descriptive message; "More Detail" button disabled when node count = 20; inline `InlineError` on modification failure); wire into `AnalogyPage.jsx` alongside `VisualModel`, `ExplanationPanel`, `LimitationsPanel`
    - On modification success: update analogy state, re-render Visual_Model
    - _Requirements: 5.1–5.10_

  - [x] 16.3 Create `client/src/components/analogy/GuestPrompt.jsx` (three actions: Create Account → `/register`, Log In → `/login`, Dismiss → hide prompt + disable concept form); create `client/src/components/ui/InlineError.jsx`, `BannerError.jsx` (dismissible with "Try again" action), `LoadingSpinner.jsx`, `EmptyState.jsx`
    - `GuestPrompt` shown after analogy displayed — analogy must be visible first
    - Dismiss: `promptDismissed = true`, concept form disabled, `sessionStorage["guestAnalogy"]` unchanged
    - `BannerError` shown on `AI_FAILURE` 503; controls remain enabled
    - _Requirements: 6.7, 6.8, 6.9, 6.13_

  - [ ]* 16.4 Write component tests for `ModificationControls` (simplify disabled when node count = 1; controls disabled during modification; re-enabled on error); write component tests for `GuestPrompt` (Dismiss hides prompt; analogy remains visible after dismiss; concept form disabled after dismiss)
    - **Property 12: Simplify blocked at frontend when node count = 1**
    - **Property 13: Expand blocked at frontend when node count = 20**
    - **Validates: Requirements 5.2, 5.3, 5.9**

- [x] 17. Library page and analogy card
  - [~] 17.1 Create `client/src/components/library/AnalogyCard.jsx` (displays `analogyTitle` as primary title; `concept` truncated at 100 chars via `truncate()`; `analogyWorld`; `createdAt` formatted as YYYY-MM-DD; text-based `previewNodes` preview listing first 3–4 nodes as `conceptLabel → analogyLabel` separated by line breaks; "Open" and "Practice" shortcut actions); create `client/src/components/library/LibraryGrid.jsx` (renders cards array; empty state via `EmptyState` if none)
    - Preview does NOT render a graph component
    - "Practice" shortcut navigates to `/practice/:analogyId`
    - "Open" navigates to `/library/:id`
    - _Requirements: 9.1–9.12_

  - [~] 17.2 Create `client/src/pages/LibraryPage.jsx` (auth-guarded via `ProtectedRoute`; fetches `GET /api/library` on mount; renders `LibraryGrid`; page-level `BannerError` on fetch failure retaining displayed state); individual analogy view in `AnalogyPage.jsx` at `/library/:id` — primary heading is `analogyTitle` (NOT "My Library"), displays `VisualModel`, `ExplanationPanel`, `LimitationsPanel`, `ModificationControls`, Practice button
    - _Requirements: 9.1–9.12_

  - [ ]* 17.3 Write component tests for `AnalogyCard` (`analogyTitle` as primary title; concept truncated at 100 chars with ellipsis; date formatted as YYYY-MM-DD; "Open" and "Practice" actions present); write component tests for `LibraryPage` (empty state shown when no analogies; `BannerError` on fetch failure)
    - **Property 17: Concept truncated at 100 chars on library card**
    - **Property 18: `analogyTitle` is primary heading in individual analogy view**
    - **Validates: Requirements 9.4, 9.5, 9.7, 9.8**

- [x] 18. Navbar and routing setup
  - [x] 18.1 Create `client/src/components/layout/Navbar.jsx` (shows Library and Practice links for authenticated users; shows Login/Register for guests; uses `useAuth()`); set up `client/src/main.jsx` with `BrowserRouter` and all routes from the design: public routes, `ProtectedRoute`-wrapped library/practice routes, auth pages
    - Practice nav link: navigates to `/practice`
    - `ProtectedRoute` redirects to `/login?from=<currentPath>` if unauthenticated
    - Route structure:
  - `/` → `HomePage`
  - `/analogy` → fresh/generated analogy flow
  - `/login` → `LoginPage` (GuestRoute)
  - `/register` → `RegisterPage` (GuestRoute)
  - `/forgot` → `ForgotPasswordPage` (GuestRoute)
  - `/reset` → `ResetPasswordPage` (GuestRoute)
  - `/library` → `LibraryPage` (ProtectedRoute)
  - `/library/:id` → saved analogy view using `AnalogyPage` (ProtectedRoute)
  - `/practice` → `PracticeLandingPage` (ProtectedRoute)
  - `/practice/:analogyId` → `PracticeSessionPage` (ProtectedRoute)
  - `/practice/:analogyId/session/:sessionId` → `PracticeSessionReviewPage` (ProtectedRoute)
  - `/practice/history` → `PracticeHistoryPage` (ProtectedRoute)
    - _Requirements: 9.1, 10.1, 10.5_

- [x] 19. Practice mode — session components and hooks
  - [~] 19.1 Create `client/src/hooks/usePractice.js` implementing the full practice state machine (`idle → loading_questions → questions_ready → evaluating → evaluated → summary → saving → saved`); on evaluation timeout: `evalLoading: false`, `error` set, `currentIndex`/`answers`/`evaluations` preserved, user can retry current question; "Practice Again" resets all state; score computed as `Math.round(correctCount / total * 100)`; additionally handle `save_error` state: when `POST /api/practice/sessions` fails, transition to `save_error` (session data retained in frontend state, user can see summary but save failed — do NOT discard session data)
    - Full state machine transitions: `idle → loading_questions → questions_ready → evaluating → evaluated → summary → saving → saved | save_error`
    - _Requirements: 10.6–10.21, 12.1_

  - [~] 19.2 Create `client/src/components/practice/AnswerOption.jsx` (states: `unselected`, `selected`, `correct`, `incorrect` via className; `role="radio"`, keyboard selectable); create `client/src/components/practice/MultipleChoiceInput.jsx` (renders `AnswerOption` list, disables all after selection, submit only enabled when option selected); create `client/src/components/practice/ShortAnswerInput.jsx` (`<textarea>`, trims whitespace before submit, disabled after submission)
    - Visual treatment via className — not inline styles; actual color tokens defined separately
    - _Requirements: 10.11, 10.12_

  - [~] 19.3 Create `client/src/components/practice/MappingReference.jsx` (renders `mappingLabel` as visually distinct callout; derived from structured data — never raw AI text as HTML); create `client/src/components/practice/ExplanationDropdown.jsx` (accessible collapsible via `<details>`/`<summary>` or `aria-expanded`; collapsed by default; trigger: "▾ See explanation"; correct: shows why correct + `MappingReference`; incorrect: shows correct answer + explanation + `MappingReference` + encouragement)
    - `aria-expanded="false"` on mount regardless of correctness
    - _Requirements: 10.15, 10.16, 10.17_

  - [~] 19.4 Create `client/src/components/practice/EvaluationFeedback.jsx` (correct → green option + "Correct ✓" text + collapsed `ExplanationDropdown`; incorrect → red option + "Not quite ✕" text + collapsed `ExplanationDropdown`; uses `MappingReference`); create `client/src/components/practice/PracticeQuestion.jsx` (dispatches to `MultipleChoiceInput` or `ShortAnswerInput`; shows question number indicator "Question N of M"; disabled once answered)
    - ALL evaluation fields rendered via dedicated UI components — no raw AI text rendered directly
    - _Requirements: 10.11–10.17, 10.20_

  - [~] 19.5 Create `client/src/components/practice/PracticeSessionSummary.jsx` (total questions, correct count, score %, mappings understood, mappings struggled with, per-incorrect explanations, encouraging message, "Practice Again" and "Generate More Questions" buttons)
    - Score: `Math.round(correctCount / total * 100)`
    -"Practice Again": `reset practice state and fetch a new question batch; this begins a new practice attempt. A new `PracticeSession` document is created only when that attempt is completed and saved`
    - "Generate More Questions": `POST /api/practice/questions/more` with `previousQuestions` texts
    - _Requirements: 10.7, 12.1_

  - [ ]* 19.6 Write component tests for `AnswerOption` (unselected/selected/correct/incorrect class states; keyboard activatable); write component tests for `ExplanationDropdown` (collapsed by default, `aria-expanded="false"`; click expands; click again collapses); write component tests for `EvaluationFeedback` (correct → "Correct ✓", selected option has correct class, dropdown collapsed; incorrect → "Not quite ✕", option has incorrect class, dropdown collapsed)
    - **Property 24: Correct evaluation → green option + "Correct ✓" + collapsed explanation**
    - **Property 25: Incorrect evaluation → red option + "Not quite ✕" + collapsed explanation**
    - **Property 26: ExplanationDropdown collapsed by default for all evaluations**
    - **Validates: Requirements 10.15, 10.16, 10.17**

  - [ ]* 19.7 Write property tests for practice state machine score calculation
    - **Property 33: `Math.round(correct / total * 100)` for all valid (correct, total) pairs**
    - **Property 28: Evaluation timeout retry preserves full session state**
    - **Validates: Requirements 10.19, 12.1**

  - [ ]* 19.8 Write component tests for `PracticeSessionSummary` (3/5 correct → score 60; 5/5 correct → score 100; "Practice Again" and "Generate More Questions" buttons present; understood and struggled mappings shown)
    - _Requirements: 10.7, 12.1_

- [x] 20. Practice pages — landing, session, history, and review
  - [~] 20.1 Create `client/src/components/practice/PracticeLanding.jsx` and `client/src/components/practice/PracticeAnalogySelector.jsx`; create `client/src/pages/PracticeLandingPage.jsx` (auth-guarded; fetches `GET /api/library` on mount; heading + "Choose an analogy to test your understanding" message; `EmptyState` if no saved analogies with link to `/analogy`; on selection navigate to `/practice/:analogyId`)
    - _Requirements: 10.1, 10.2, 10.3_
    - Component test: `PracticeLandingPage` renders `EmptyState` component with a link to `/analogy` when the user has no saved analogies (mock `GET /api/library` returns empty array)

  - [~] 20.2 Create `client/src/pages/PracticeSessionPage.jsx` (extracts `analogyId` from route params; fetches `GET /api/analogies/:id`; posts to `POST /api/practice/questions`; uses `usePractice`; renders one `PracticeQuestion` at a time; on evaluation timeout shows error + "Try Again"; on session complete posts `POST /api/practice/sessions` then shows `PracticeSessionSummary`; "Generate More Questions" posts `POST /api/practice/questions/more` with `previousQuestions`)
    - _Requirements: 10.3, 10.6–10.21, 12.1–12.3_

  - [~] 20.3 Create `client/src/components/practice/PracticeHistory.jsx` and `client/src/components/practice/PracticeHistoryCard.jsx` (displays `analogyTitle`, `analogyWorld`, formatted `completedAt`, score %, question count, weak area count; clickable → `/practice/:analogyId/session/:sessionId`); create `client/src/pages/PracticeHistoryPage.jsx` (auth-guarded; fetches `GET /api/practice/history`; renders `PracticeHistory`; empty state if none; ordered newest first)
    - _Requirements: 12.5, 12.7, 12.8, 12.9_

  - [~] 20.4 Create `client/src/components/practice/PracticeSessionReview.jsx` (read-only render of all questions + user answers + `EvaluationFeedback` with collapsed `ExplanationDropdown` available for each; ZERO AI calls; "Practice Again" → `/practice/:analogyId`; "Generate More Questions" → posts `POST /api/practice/questions/more` with session's question texts then navigates to session); create `client/src/pages/PracticeSessionReviewPage.jsx` (extracts `analogyId` and `sessionId`; fetches `GET /api/practice/sessions/:analogyId/:sessionId`; renders `PracticeSessionReview`)
    - **No new AI calls during review — all data from stored `PracticeSession` document**
    - _Requirements: 12.4, 12.5, 12.6_

  - [ ]* 20.5 Write component tests for `PracticeHistoryCard` (`analogyTitle`, `analogyWorld`, score %, question count, weak area count, formatted date all rendered); write component tests for `PracticeSessionReview` (all questions displayed; no AI call triggered on mount; "Practice Again" and "Generate More Questions" present; each `ExplanationDropdown` starts collapsed)
    - **Property 19: Practice route `/practice` renders `PracticeLandingPage`**
    - **Property 20: Selecting analogy from landing starts session for that analogy**
    - **Property 31: Historical session review requires zero AI calls**
    - **Validates: Requirements 10.1, 10.2, 10.3, 12.5, 12.6**

- [x] 21. AI response round-trip validation and security hardening
  - [~] 21.1 Add round-trip validation in `analogy.controller.js` save/update paths: after AI_Response is stored and retrieved, re-run `validateAIResponse` on the deserialized document; verify `analogyTitle` and all fields survive `JSON.stringify → JSON.parse` exactly; add input sanitization for `guestAnalogy` transfer paths (both registration and post-login) — `validateAIResponse` MUST pass before saving; reject otherwise (registration still succeeds)
    - _Requirements: 7.9, 15.1, 15.4_

  - [ ]* 21.2 Write property tests for AI_Response round-trip serialization and `analogyTitle` survival
    - **Property 35: `JSON.parse(JSON.stringify(obj))` deep-equals `obj` for all valid AI_Response objects**
    - **Property 7: `analogyTitle` never includes Analogy_World name**
    - **Validates: Requirements 15.1, 15.4, 17.2, 17.3, 17.4**

- [~] 22. Final checkpoint — full stack integration
  - Wire frontend API calls to the running backend; verify the complete user journey end-to-end using automated integration and component tests: guest generation → `GuestPrompt` → register/login with analogy transfer → library view → analogy modification → practice session → session summary → practice history → session review. Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for full traceability
- Property test tasks reference the exact property number from `design.md` and use `fast-check` with ≥100 iterations per test
- Unit tests use Vitest (frontend) and Vitest or Jest (backend)
- Integration tests use Supertest + `mongodb-memory-server`
- Component tests use React Testing Library
- All AI calls in tests are mocked — no real LLM calls during test runs
- `confirmPassword` is NEVER sent to the backend; the `User` schema has no such field
- Node positions are NEVER stored in the database — computed at render time by Dagre
- Guest_ID cookie is server-managed (HttpOnly); `sessionStorage["guestAnalogy"]` is client-managed; clearing one does NOT affect the other
- Visual styling tokens (colors, typography, spacing) are intentionally excluded from this task list per the design's Visual Design Status section

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["1.4", "2.1", "2.2", "4.1"] },
    { "id": 2, "tasks": ["2.3", "2.4", "3.1", "4.2"] },
    { "id": 3, "tasks": ["3.2", "3.3", "4.3", "4.4", "6.1"] },
    { "id": 4, "tasks": ["3.4", "3.5", "4.5", "6.2", "7.1"] },
    { "id": 5, "tasks": ["5", "7.2", "7.3", "7.4", "8.1", "10.1"] },
    { "id": 6, "tasks": ["7.5", "8.2", "9.1", "9.2", "9.3", "10.2"] },
    { "id": 7, "tasks": ["9.4", "9.5", "9.6", "11"] },
    { "id": 8, "tasks": ["12.1"] },
    { "id": 9, "tasks": ["12.2", "13.1"] },
    { "id": 10, "tasks": ["12.3", "12.4", "13.2", "13.3"] },
    { "id": 11, "tasks": ["14.1", "14.2", "15.1", "18.1"] },
    { "id": 12, "tasks": ["14.3", "15.2", "15.3"] },
    { "id": 13, "tasks": ["15.4", "15.5", "16.1", "16.2", "16.3"] },
    { "id": 14, "tasks": ["16.4", "17.1", "19.1", "19.2"] },
    { "id": 15, "tasks": ["17.2", "17.3", "19.3", "19.4"] },
    { "id": 16, "tasks": ["19.5", "19.6", "19.7", "20.1"] },
    { "id": 17, "tasks": ["19.8", "20.2", "20.3", "20.4"] },
    { "id": 18, "tasks": ["20.5", "21.1"] },
    { "id": 19, "tasks": ["21.2"] },
    { "id": 20, "tasks": ["22"] }
  ]
}
```



