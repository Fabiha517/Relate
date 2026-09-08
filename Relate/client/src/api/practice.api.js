import axios from 'axios'

const practiceClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

// ============================================================
// GENERATE INITIAL PRACTICE QUESTIONS
// ============================================================

export async function generatePracticeQuestions({
  analogyId,
  concept,
  analogyWorld,
  nodes,
  mappings,
  relationships,
  explanation,
  limitations,
}) {
  const response = await practiceClient.post(
    '/practice/questions',
    {
      analogyId,
      concept,
      analogyWorld,
      nodes,
      mappings,
      relationships,
      explanation,
      limitations,
    }
  )

  return response.data
}

// ============================================================
// GENERATE MORE PRACTICE QUESTIONS
// ============================================================

export async function generateMorePracticeQuestions({
  analogyId,
  concept,
  analogyWorld,
  nodes,
  mappings,
  relationships,
  explanation,
  limitations,
  previousQuestions,
}) {
  const response = await practiceClient.post(
    '/practice/questions/more',
    {
      analogyId,
      concept,
      analogyWorld,
      nodes,
      mappings,
      relationships,
      explanation,
      limitations,
      previousQuestions,
    }
  )

  return response.data
}

// ============================================================
// EVALUATE PRACTICE ANSWER
// ============================================================

export async function evaluatePracticeAnswer({
  question,
  userAnswer,
}) {
  const response = await practiceClient.post(
    '/practice/evaluate',
    {
      question,
      userAnswer,
    }
  )

  return response.data
}

// ============================================================
// CREATE / SAVE PRACTICE SESSION
// ============================================================

export async function savePracticeSession({
  analogyId,
  questions,
  answers,
  evaluations,
  score,
  misconceptions,
  completedAt,
}) {
  const response = await practiceClient.post(
    '/practice/sessions',
    {
      analogyId,
      questions,
      answers,
      evaluations,
      score,
      misconceptions,
      completedAt,
    }
  )

  return response.data
}

// ============================================================
// UPDATE EXISTING PRACTICE SESSION
// ============================================================

export async function updatePracticeSession(
  sessionId,
  {
    analogyId,
    questions,
    answers,
    evaluations,
    score,
    misconceptions,
    completedAt,
  }
) {
  const response = await practiceClient.patch(
    `/practice/sessions/${sessionId}`,
    {
      analogyId,
      questions,
      answers,
      evaluations,
      score,
      misconceptions,
      completedAt,
    }
  )

  return response.data
}

// ============================================================
// GET PRACTICE HISTORY
// ============================================================

export async function getPracticeHistory() {
  const response = await practiceClient.get(
    '/practice/history'
  )

  return response.data
}

// ============================================================
// GET ALL SESSIONS FOR ONE ANALOGY
// ============================================================

export async function getPracticeSessionsForAnalogy(
  analogyId
) {
  const response = await practiceClient.get(
    `/practice/sessions/${analogyId}`
  )

  return response.data
}

// ============================================================
// GET ONE SPECIFIC PRACTICE SESSION
// ============================================================

export async function getPracticeSession(
  analogyId,
  sessionId
) {
  const response = await practiceClient.get(
    `/practice/sessions/${analogyId}/${sessionId}`
  )

  return response.data
}

// ============================================================
// DELETE PRACTICE SESSION
// ============================================================

export async function deletePracticeSession(
  sessionId
) {
  const response = await practiceClient.delete(
    `/practice/sessions/${sessionId}`
  )

  return response.data
}