import axios from 'axios'

const analogyClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

export async function generateAnalogy({
  concept,
  analogyWorld,
}) {
  const response = await analogyClient.post(
    '/analogies/generate',
    {
      concept,
      analogyWorld,
    }
  )

  return response.data
}

export async function saveAnalogy({
  analogyTitle,
  concept,
  analogyWorld,
  nodes,
  mappings,
  relationships,
  explanation,
  limitations,
}) {
  const response = await analogyClient.post(
    '/analogies',
    {
      analogyTitle,
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

export async function getAnalogy(analogyId) {
  const response =
    await analogyClient.get(
      `/analogies/${analogyId}`
    )

  return response.data
}

export async function updateAnalogy(
  analogyId,
  params
) {
  const response =
    await analogyClient.put(
      `/analogies/${analogyId}`,
      params
    )

  return response.data
}

export async function deleteAnalogy(
  analogyId
) {
  await analogyClient.delete(
    `/analogies/${analogyId}`
  )
}

/**
 * Modify a saved analogy.
 */
export async function modifyAnalogy(
  analogyId,
  params
) {
  const response =
    await analogyClient.post(
      `/analogies/${analogyId}/modify`,
      params
    )

  return response.data
  }

export default analogyClient