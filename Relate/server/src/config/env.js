'use strict';

const REQUIRED_VARS = [
  'MONGODB_URI',
  'JWT_SECRET',
  'LLM_PROVIDER',
  'LLM_API_KEY',
  'LLM_MODEL',
  'EMAIL_HOST',
  'EMAIL_USER',
  'EMAIL_PASS',
  'CLIENT_ORIGIN'
];

const missing = REQUIRED_VARS.filter(v => !process.env[v]);
if (missing.length > 0) {
  // Only variable NAMES are logged — never partial values
  console.error(`[Startup Error] Missing required environment variables:\n  ${missing.join('\n  ')}`);
  process.exit(1);
}

module.exports = {
  mongoUri:                      process.env.MONGODB_URI,
  jwtSecret:                     process.env.JWT_SECRET,
  llmProvider:                   process.env.LLM_PROVIDER,
  llmApiKey:                     process.env.LLM_API_KEY,
  llmModel:                      process.env.LLM_MODEL,
  nodeEnv:                       process.env.NODE_ENV || 'development',
  port:                          parseInt(process.env.PORT) || 5000,
  clientOrigin:                  process.env.CLIENT_ORIGIN,
  practiceQuestionCount:         parseInt(process.env.PRACTICE_QUESTION_COUNT) || 5,
  aiAnalogyTimeoutMs:            parseInt(process.env.AI_ANALOGY_TIMEOUT_MS) || 30000,
  aiPracticeQuestionsTimeoutMs:  parseInt(process.env.AI_PRACTICE_QUESTIONS_TIMEOUT_MS) || 15000,
  aiPracticeEvaluationTimeoutMs: parseInt(process.env.AI_PRACTICE_EVALUATION_TIMEOUT_MS) || 15000,
  aiMaxRetries:                  parseInt(process.env.AI_MAX_RETRIES) || 2,
  guestCookieMaxAgeMs:           parseInt(process.env.GUEST_COOKIE_MAX_AGE_MS) || 2592000000
};
