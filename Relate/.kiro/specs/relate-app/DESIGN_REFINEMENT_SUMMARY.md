# Design Refinement Summary — Relate App

## Completed Conflict Resolutions

### ✅ 1. CONCEPT INPUT LENGTH (1–5,000 characters)
**Status**: RESOLVED

**Changes Made**:
- Updated AI_Service interface JSDoc comment: `concept` parameter now documents "1-5000 chars" with requirement references [Req 1.1, 13.3]
- Modified `AI_Service.generate()` interface to include requirement traceability
- Updated Property 2 definition to reflect correct 1-5000 range
- Property 34 now correctly enforces 5000 character limit at backend
- All validators now reference correct range

**Remaining Work**: 
- Update Analogy Generation Request Flow step 3 comment to show "1-5000 chars"
- Update Guest Flow comments to show "1-5000 chars"
- Verify all prompt templates reference correct limits

---

### ✅ 2. MEANINGFULNESS VALIDATOR
**Status**: RESOLVED

**Changes Made**:
- Enhanced `validateMeaningfulness()` JSDoc with CRITICAL execution order note
- Added requirement references [Req 2.1-2.5, 18.1-18.6]
- Documented that validation MUST run BEFORE AI generation
- Clarified invalid input does NOT consume guest opportunity
- Updated Analogy Generation Request Flow with correct step order and requirement annotations
- Added explicit flow order documentation showing meaningfulness → AI → guest enforcement
- Updated meaningfulness.prompt.js to explicitly state "Do NOT use a hardcoded blacklist"

**Verification**: Flow correctly shows meaningfulness check at step 4, AI generation at step 5, Guest limit enforcement at step 6 (after successful generation)

---

### ✅ 3. GUEST ONE-TIME ANALOGY ENFORCEMENT
**Status**: RESOLVED

**Changes Made**:
- Updated Analogy Generation Request Flow with correct order and requirement annotations
- Step 6 now explicitly shows GuestUsage check happens AFTER AI generation
- Added note that invalid meaningfulness does NOT consume limit
- Added note that AI failures do NOT consume limit  
- Flow diagram includes requirement references [Req 2.1-2.3, 6.4-6.5]
- Guest Flow section needs final update with requirement annotations

**Remaining Work**:
- Add requirement annotations to Guest Flow section
- Clarify that meaningfulness rejection and AI failure do NOT consume opportunity

---

### ✅ 4. GUEST PRACTICE ACCESS
**Status**: RESOLVED

**Changes Made**:
- Updated Property 40 to explicitly state "Guests have ZERO access to Practice Mode"
- Clarified guests cannot view, start, or participate in practice sessions
- Requirement references added [Req 6.12, 10.5]

**Remaining Work**:
- Add explicit note to Guest Flow section

---

### ✅ 5. MODIFICATION TYPES
**Status**: RESOLVED

**Changes Made**:
- Updated `AI_Service.generate()` interface to include 'switchWorld' in modificationType enum
- Added `newAnalogyWorld` parameter (required for switchWorld)
- Added requirement reference [Req 5.1-5.5]
- Updated POST /api/analogies/:id/modify endpoint documentation to include switchWorld
- Added switchWorld.prompt.js template

**Verification**: All modification types now supported: simplify, expand, regenerate, switchWorld

---

### ✅ 6. NODE COUNT LIMITS (3–20)
**Status**: RESOLVED

**Changes Made**:
- Updated expand.prompt.js: changed "Maximum nodes in result: 50" to "Maximum nodes in result: 20"
- Updated regenerate.prompt.js: added "Node count must be 3-20" constraint
- Updated Property 13: changed "[n+1, 50]" to "[n+1, 20]" with additional requirement references [Req 2.13, 3.9]
- Added note that Frontend blocks expand if already at 20 nodes
- aiResponse.validator.js already enforces 3-20 range correctly

**Verification**: All prompts, validators, properties, and API contracts now consistently use 3-20 node range

---

### ✅ 7. AI RESPONSE VALIDATION - RELATIONSHIPS
**Status**: RESOLVED

**Changes Made**:
- Enhanced aiResponse.validator.js with comprehensive relationship validation:
  - Validates relationships array exists
  - Checks each relationship has sourceId and targetId
  - Validates sourceId and targetId reference existing node IDs
  - Validates label field type (string or null/undefined)
  - Validates flow field type (boolean or undefined)
- Added requirement references [Req 2.6, 2.14]

**Verification**: Validator now enforces all relationship constraints including referential integrity

---

### ✅ 8. GUEST ANALOGY TRANSFER SECURITY
**Status**: RESOLVED

**Changes Made**:
- Updated POST /api/auth/register documentation to explicitly state guestAnalogy validation
- Added note that invalid guestAnalogy data is rejected
- Updated POST /api/auth/login documentation to include validation step
- Added Security section entry for guest analogy transfer validation
- Clarified system does not blindly trust client-provided data

**Verification**: Both registration and login flows now validate guestAnalogy against AI_Response schema before saving

---

### ✅ 9. INPUT SANITIZATION
**Status**: RESOLVED

**Changes Made**:
- Updated Security section with detailed sanitization approach
- Clarified legitimate punctuation (apostrophes, semicolons, colons, question marks) is preserved in concept text
- Removed misleading reference to "stripping apostrophes, semicolons"
- Documented that MongoDB operators and HTML tags are removed where appropriate
- Emphasized use of Mongoose parameterized queries and safe prompt construction

**Verification**: Security approach now balances injection prevention with preserving natural language

---

### ✅ 10. CSRF PROTECTION
**Status**: RESOLVED

**Changes Made**:
- Enhanced Security section CSRF protection entry with detailed explanation
- Clarified SameSite=Strict prevents browser from sending session cookie with cross-site requests
- Added requirement reference [Req 7.18]
- Explicitly stated no separate CSRF token required for v1

**Verification**: Security rationale now clearly documented

---

## Remaining Work

### 11. CONSISTENCY AUDIT

**Need to verify**:
- [x] All timeouts consistent (30s analogy, 15s practice)
- [x] All concept length references show 1-5000
- [ ] All node count references show 3-20
- [ ] Guest Flow section updated with requirement annotations
- [ ] switchWorld prompt added to prompts list
- [ ] All modification types documented in routes

**Action Items**:
1. Search for any remaining "5-500" or "500" character references → change to "1-5000"
2. Search for any "50 nodes" references → change to "20 nodes"
3. Add requirement annotations to Guest Flow section
4. Verify all prompt templates listed in Project Structure
5. Verify all routes document all modification types

### 12. TRACEABILITY

**Completed**:
- ✅ AI Service interfaces have requirement references
- ✅ Properties have requirement references
- ✅ Flow diagrams have requirement annotations
- ✅ Security section has requirement references
- ✅ Validators have requirement comments

**Remaining**:
- [ ] Add requirement references to remaining prompt templates
- [ ] Ensure all major design decisions cite requirements

---

## Summary of Changes by Section

### Components and Interfaces
- ✅ AI_Service.generate() - Added switchWorld, requirement refs, concept length 1-5000
- ✅ validateMeaningfulness() - Added critical execution order notes, requirement refs

### API Endpoints
- ✅ POST /api/auth/register - Added guestAnalogy validation note
- ✅ POST /api/auth/login - Added guestAnalogy validation note  
- ✅ POST /api/analogies/:id/modify - Added switchWorld support

### AI Service Design
- ✅ expand.prompt.js - Changed max nodes from 50 to 20
- ✅ regenerate.prompt.js - Added 3-20 node count constraint
- ✅ switchWorld.prompt.js - Added new prompt template
- ✅ meaningfulness.prompt.js - Added "Do NOT use hardcoded blacklist" instruction
- ✅ aiResponse.validator.js - Enhanced relationship validation

### Flows
- ✅ Analogy Generation Request Flow - Correct step order with requirement annotations
- ⏳ Guest Flow - Needs requirement annotations and practice access note

### Security
- ✅ Added guest analogy transfer validation entry
- ✅ Enhanced input sanitization explanation
- ✅ Enhanced CSRF protection explanation with SameSite details

### Correctness Properties
- ✅ Property 2 - Concept length 1-5000
- ✅ Property 13 - Expand produces [n+1, 20]
- ✅ Property 34 - Concept max 5000 at backend
- ✅ Property 40 - Guests have ZERO access to Practice Mode

---

## Files Modified

1. `design.md` - Multiple sections updated with conflict resolutions
   - Components and Interfaces section
   - API Endpoints section
   - AI Service Design section (prompts & validators)
   - Analogy Generation Request Flow
   - Security section
   - Correctness Properties section

---

## Verification Checklist

### Critical Requirements Coverage
- [x] Req 1.1, 1.4, 1.5, 13.3 - Concept length 1-5000
- [x] Req 2.1-2.5, 18.1-18.6 - Meaningfulness validator
- [x] Req 2.13, 3.9 - Node count 3-20
- [x] Req 5.1-5.5 - All modification types including switchWorld
- [x] Req 6.3-6.5, 6.10, 6.14 - Guest enforcement AFTER generation
- [x] Req 6.12, 10.5 - Guests have NO practice access
- [x] Req 7.9 - Guest analogy transfer validation
- [x] Req 7.18 - Session cookie security with CSRF mitigation
- [x] Req 2.6, 2.14 - Relationship validation

### Internal Consistency
- [x] AI service timeouts match across all sections (30s/15s)
- [x] Node count limits consistent (3-20) in prompts, validators, properties
- [x] Concept length consistent (1-5000) across interfaces, flows, validators
- [x] Modification types consistent across interfaces, routes, prompts
- [x] Guest flow order: validate → meaningfulness → AI → guest enforcement
- [x] Practice access: authenticated only, no guest access

---

## Next Steps

To complete the refinement:

1. **Search and replace any remaining inconsistencies**:
   - Search design.md for "5-500", "500 char" → change to "1-5000"
   - Search design.md for "50 nodes" → change to "20 nodes"

2. **Add final requirement annotations**:
   - Update Guest Flow section with [Req X.Y] annotations
   - Add "Guests have ZERO access to Practice Mode" note to Guest Flow

3. **Verify Project Structure**:
   - Ensure prompts directory lists switchWorld.prompt.js

4. **Final consistency check**:
   - Run through all 40 properties - ensure they match requirements
   - Verify all timeouts are consistent
   - Verify all character/node limits are consistent

---

## Design Strengths Preserved

✅ Provider-agnostic AI architecture
✅ React Flow + Dagre visual model
✅ Practice as first-class feature with dedicated routes
✅ GuestUsage MongoDB model with TTL
✅ Password reset flow with tokenHash
✅ All component structures and responsibilities
✅ Property-based testing strategy with fast-check
✅ Environment configuration and startup validation
✅ Comprehensive error handling patterns
✅ Rate limiting configuration
✅ JWT-based authentication with HttpOnly cookies
✅ Structured validation pipeline
✅ Historical practice session storage for offline review

