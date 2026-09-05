'use strict';

/**
 * validate.middleware.js
 *
 * Provides:
 *   - sanitize(fields)         — middleware factory that sanitises named req.body fields
 *   - Per-endpoint validator middleware functions
 *
 * Sanitization rules (design.md Security section):
 *   - name / email fields : strip HTML tags AND coerce non-string values to empty string
 *   - concept field       : strip HTML tags but preserve ALL legitimate punctuation in the
 *                           text value (apostrophes, question marks, colons, etc.)
 *   - MongoDB operator injection is prevented by coercing any non-string body value for
 *     these fields to an empty string (objects with $ / . keys are therefore neutralised)
 *
 * Validators return 400 with the standard error envelope on failure:
 *   { error: { code: "VALIDATION_ERROR", message: "Validation failed.", fields: { … } } }
 */

// --- Helpers ------------------------------------------------------------------

/**
 * Strip HTML tags from a string value.
 * e.g. "<script>alert(1)</script>hello" ? "hello"
 */
function stripHtml(value) {
  if (typeof value !== 'string') return '';
  // Remove complete tags including their content for script/style,
  // then strip remaining tag markup.
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, '');
}

/**
 * Coerce a body field to a safe string.
 *   - If the value is an object (potential MongoDB operator injection), return ''.
 *   - Otherwise cast to string and strip HTML tags.
 */
function toSafeString(value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'object') return ''; // neutralises { $where: ... } etc.
  return stripHtml(String(value));
}

/**
 * Sanitise a concept value: cast to string, strip HTML tags, but preserve
 * all punctuation characters so natural-language concepts are unaffected.
 * Objects are still coerced to '' to prevent injection via key names.
 */
function toSafeConceptString(value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'object') return '';
  // Only strip HTML tags — do not remove any punctuation from the text value.
  return stripHtml(String(value));
}

/**
 * Email structural validation (Property 14):
 * Valid iff: exactly one '@', non-empty local part before it, domain after it
 * contains at least one '.'.
 */
function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  return local.length > 0 && domain.includes('.');
}

/**
 * Build and send a 400 VALIDATION_ERROR response.
 */
function validationError(res, fields) {
  return res.status(400).json({
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed.',
      fields
    }
  });
}

// --- Sanitize middleware factory ----------------------------------------------

/**
 * sanitize(fields)
 *
 * Returns Express middleware that sanitises the listed field names in req.body.
 *
 * Fields named 'name' or 'email'  ? toSafeString  (HTML stripped, object ? '')
 * Fields named 'concept'          ? toSafeConceptString (HTML stripped only)
 * All other string fields listed  ? toSafeString
 *
 * Usage:
 *   router.post('/register',
 *     sanitize(['name', 'email']),
 *     validateRegister,
 *     authController.register
 *   );
 *
 * @param {string[]} fields - Field names in req.body to sanitise
 */
function sanitize(fields) {
  return function sanitizeMiddleware(req, _res, next) {
    if (!req.body || typeof req.body !== 'object') {
      req.body = {};
      return next();
    }

    for (const field of fields) {
      if (!(field in req.body)) continue; // leave absent fields absent

      if (field === 'concept') {
        req.body[field] = toSafeConceptString(req.body[field]);
      } else {
        // name, email, and any other listed string fields
        req.body[field] = toSafeString(req.body[field]);
      }
    }

    next();
  };
}

// --- Per-endpoint validators --------------------------------------------------

/**
 * POST /api/analogies/generate
 * Body: { concept, analogyWorld }
 */
function validateGenerateAnalogy(req, res, next) {
  const fields = {};
  const { concept, analogyWorld } = req.body || {};

  const conceptStr = typeof concept === 'string' ? concept : '';
  if (conceptStr.length === 0) {
    fields.concept = 'Concept is required.';
  } else if (conceptStr.length > 5000) {
    fields.concept = 'Concept must be 5000 characters or fewer.';
  }

  const worldStr = typeof analogyWorld === 'string' ? analogyWorld.trim() : '';
  if (worldStr.length === 0) {
    fields.analogyWorld = 'Please select an Analogy World.';
  }

  if (Object.keys(fields).length > 0) {
    return validationError(res, fields);
  }
  next();
}

/**
 * POST /api/analogies
 * Body: { analogyTitle, concept, analogyWorld, nodes, mappings, relationships,
 *         explanation, limitations }
 */
function validateSaveAnalogy(req, res, next) {
  const fields = {};
  const {
    analogyTitle,
    concept,
    analogyWorld,
    nodes,
    mappings,
    relationships,
    explanation,
    limitations
  } = req.body || {};

  // analogyTitle
  if (!analogyTitle || typeof analogyTitle !== 'string' || analogyTitle.trim().length === 0) {
    fields.analogyTitle = 'Analogy title is required.';
  }

  // concept (1–5000)
  const conceptStr = typeof concept === 'string' ? concept : '';
  if (conceptStr.length === 0) {
    fields.concept = 'Concept is required.';
  } else if (conceptStr.length > 5000) {
    fields.concept = 'Concept must be 5000 characters or fewer.';
  }

  // analogyWorld
  const worldStr = typeof analogyWorld === 'string' ? analogyWorld.trim() : '';
  if (worldStr.length === 0) {
    fields.analogyWorld = 'Analogy World is required.';
  }

  // nodes — array [3, 20]
  if (!Array.isArray(nodes) || nodes.length < 3 || nodes.length > 20) {
    fields.nodes = 'Nodes must be an array of 3 to 20 items.';
  }

  // mappings — array, min 1
  if (!Array.isArray(mappings) || mappings.length < 1) {
    fields.mappings = 'Mappings must be a non-empty array.';
  }

  // relationships — array (may be empty)
  if (!Array.isArray(relationships)) {
    fields.relationships = 'Relationships must be an array.';
  }

  // explanation
  if (!explanation || typeof explanation !== 'string' || explanation.trim().length === 0) {
    fields.explanation = 'Explanation is required.';
  }

  // limitations — array [1, 10]
  if (!Array.isArray(limitations) || limitations.length < 1 || limitations.length > 10) {
    fields.limitations = 'Limitations must be an array of 1 to 10 items.';
  }

  if (Object.keys(fields).length > 0) {
    return validationError(res, fields);
  }
  next();
}

/**
 * POST /api/analogies/:id/modify
 * Body: { modificationType, analogyWorld? }
 */
function validateModifyAnalogy(req, res, next) {
  const fields = {};
  const VALID_TYPES = ['simplify', 'expand', 'regenerate', 'switchWorld'];
  const { modificationType, analogyWorld } = req.body || {};

  if (!modificationType || !VALID_TYPES.includes(modificationType)) {
    fields.modificationType =
      "Modification type must be one of: 'simplify', 'expand', 'regenerate', 'switchWorld'.";
  }

  // switchWorld requires an analogyWorld
  if (modificationType === 'switchWorld') {
    const worldStr = typeof analogyWorld === 'string' ? analogyWorld.trim() : '';
    if (worldStr.length === 0) {
      fields.analogyWorld = 'Analogy World is required when switching worlds.';
    }
  }

  if (Object.keys(fields).length > 0) {
    return validationError(res, fields);
  }
  next();
}

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 * (confirmPassword is frontend-only — never validated server-side per Req 7.8)
 *
 * Exact error messages are specified in Requirements 7.2–7.5.
 */
function validateRegister(req, res, next) {
  const fields = {};
  const { name, email, password } = req.body || {};

  // name: required, 1–100 chars
  const nameStr = typeof name === 'string' ? name.trim() : '';
  if (nameStr.length === 0) {
    fields.name = 'Please enter your name.';
  } else if (nameStr.length > 100) {
    fields.name = 'Name must be no more than 100 characters.';
  }

  // email: required, valid structural format
  const emailStr = typeof email === 'string' ? email.trim() : '';
  if (emailStr.length === 0 || !isValidEmail(emailStr)) {
    fields.email = 'Please enter a valid email address.';
  }

  // password: required, 8–128 chars
  const passwordStr = typeof password === 'string' ? password : '';
  if (passwordStr.length === 0) {
    // treat absent/empty as "too short" — pick the =8 message for UX clarity
    fields.password = 'Password must be at least 8 characters.';
  } else if (passwordStr.length < 8) {
    fields.password = 'Password must be at least 8 characters.';
  } else if (passwordStr.length > 128) {
    fields.password = 'Password must be no more than 128 characters.';
  }

  if (Object.keys(fields).length > 0) {
    return validationError(res, fields);
  }
  next();
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
function validateLogin(req, res, next) {
  const fields = {};
  const { email, password } = req.body || {};

  const emailStr = typeof email === 'string' ? email.trim() : '';
  if (emailStr.length === 0) {
    fields.email = 'Email is required.';
  }

  const passwordStr = typeof password === 'string' ? password : '';
  if (passwordStr.length === 0) {
    fields.password = 'Password is required.';
  }

  if (Object.keys(fields).length > 0) {
    return validationError(res, fields);
  }
  next();
}

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 */
function validateForgotPassword(req, res, next) {
  const fields = {};
  const { email } = req.body || {};

  const emailStr = typeof email === 'string' ? email.trim() : '';
  if (emailStr.length === 0 || !isValidEmail(emailStr)) {
    fields.email = 'Please enter a valid email address.';
  }

  if (Object.keys(fields).length > 0) {
    return validationError(res, fields);
  }
  next();
}

/**
 * POST /api/auth/reset-password
 * Body: { token, newPassword }
 */
function validateResetPassword(req, res, next) {
  const fields = {};
  const { token, newPassword } = req.body || {};

  const tokenStr = typeof token === 'string' ? token.trim() : '';
  if (tokenStr.length === 0) {
    fields.token = 'Reset token is required.';
  }

  const passwordStr = typeof newPassword === 'string' ? newPassword : '';
  if (passwordStr.length === 0) {
    fields.newPassword = 'Password must be at least 8 characters.';
  } else if (passwordStr.length < 8) {
    fields.newPassword = 'Password must be at least 8 characters.';
  } else if (passwordStr.length > 128) {
    fields.newPassword = 'Password must be no more than 128 characters.';
  }

  if (Object.keys(fields).length > 0) {
    return validationError(res, fields);
  }
  next();
}

/**
 * PUT /api/auth/profile
 * Body: { name }
 */
function validateUpdateProfile(req, res, next) {
  const fields = {};
  const { name } = req.body || {};

  // name: required, 1–100 chars
  const nameStr = typeof name === 'string' ? name.trim() : '';
  if (nameStr.length === 0) {
    fields.name = 'Please enter your name.';
  } else if (nameStr.length > 100) {
    fields.name = 'Name must be no more than 100 characters.';
  }

  if (Object.keys(fields).length > 0) {
    return validationError(res, fields);
  }
  next();
}

/**
 * PUT /api/auth/password
 * Body: { currentPassword, newPassword }
 */
function validateChangePassword(req, res, next) {
  const fields = {};
  const { currentPassword, newPassword } = req.body || {};

  // currentPassword: required
  const currentPasswordStr = typeof currentPassword === 'string' ? currentPassword : '';
  if (currentPasswordStr.length === 0) {
    fields.currentPassword = 'Current password is required.';
  }

  // newPassword: required, 8–128 chars (same rules as registration)
  const newPasswordStr = typeof newPassword === 'string' ? newPassword : '';
  if (newPasswordStr.length === 0) {
    fields.newPassword = 'New password is required.';
  } else if (newPasswordStr.length < 8) {
    fields.newPassword = 'Password must be at least 8 characters.';
  } else if (newPasswordStr.length > 128) {
    fields.newPassword = 'Password must be no more than 128 characters.';
  }

  if (Object.keys(fields).length > 0) {
    return validationError(res, fields);
  }
  next();
}

/**
 * POST /api/practice/questions
 * Body: { analogyId, concept, analogyWorld, nodes, mappings, relationships,
 *         explanation, limitations }
 * Only analogyId is required at the schema level here; the full analogy context
 * fields are forwarded to the AI service and validated by the AI response validator.
 */
function validatePracticeQuestions(req, res, next) {
  const fields = {};
  const { analogyId } = req.body || {};

  const idStr = typeof analogyId === 'string' ? analogyId.trim() : '';
  if (idStr.length === 0) {
    fields.analogyId = 'Analogy ID is required.';
  }

  if (Object.keys(fields).length > 0) {
    return validationError(res, fields);
  }
  next();
}

/**
 * POST /api/practice/evaluate
 * Body: { question, userAnswer }
 */
function validatePracticeEvaluate(req, res, next) {
  const fields = {};
  const { question, userAnswer } = req.body || {};

  if (!question || typeof question !== 'object' || Array.isArray(question)) {
    fields.question = 'Question is required and must be an object.';
  }

  const answerStr = typeof userAnswer === 'string' ? userAnswer : '';
  if (answerStr.trim().length === 0) {
    fields.userAnswer = 'User answer is required.';
  }

  if (Object.keys(fields).length > 0) {
    return validationError(res, fields);
  }
  next();
}

/**
 * POST /api/practice/sessions
 * Body: { analogyId, questions, answers, evaluations, score, completedAt }
 */
function validateSavePracticeSession(req, res, next) {
  const fields = {};
  const { analogyId, questions, answers, evaluations, score, completedAt } =
    req.body || {};

  // analogyId
  const idStr = typeof analogyId === 'string' ? analogyId.trim() : '';
  if (idStr.length === 0) {
    fields.analogyId = 'Analogy ID is required.';
  }

  // questions — array, min 1
  if (!Array.isArray(questions) || questions.length < 1) {
    fields.questions = 'Questions must be a non-empty array.';
  }

  // answers — array (may be empty if all questions were skipped, but must be array)
  if (!Array.isArray(answers)) {
    fields.answers = 'Answers must be an array.';
  }

  // evaluations — array
  if (!Array.isArray(evaluations)) {
    fields.evaluations = 'Evaluations must be an array.';
  }

  // score — number, 0–100
  if (typeof score !== 'number' || score < 0 || score > 100) {
    fields.score = 'Score must be a number between 0 and 100.';
  }

  // completedAt — required, valid ISO date string
  if (!completedAt || typeof completedAt !== 'string' || isNaN(Date.parse(completedAt))) {
    fields.completedAt = 'Completed date must be a valid ISO date string.';
  }

  if (Object.keys(fields).length > 0) {
    return validationError(res, fields);
  }
  next();
}

// --- Exports ------------------------------------------------------------------

module.exports = {
  sanitize,
  validateGenerateAnalogy,
  validateSaveAnalogy,
  validateModifyAnalogy,
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateUpdateProfile,
  validateChangePassword,
  validatePracticeQuestions,
  validatePracticeEvaluate,
  validateSavePracticeSession,
  // Export the email and password helpers so unit tests and other modules
  // can validate directly without going through HTTP middleware.
  _isValidEmail: isValidEmail
};
