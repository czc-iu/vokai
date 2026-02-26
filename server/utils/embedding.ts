import { ERROR_MESSAGES } from './constants'

export interface OpenAIEmbeddingResponse {
  object: string
  data: Array<{
    object: string
    index: number
    embedding: number[]
  }>
  model: string
  usage: {
    prompt_tokens: number
    total_tokens: number
  }
}

export interface DashScopeEmbeddingResponse {
  output: {
    embeddings: Array<{
      text_index: number
      embedding: number[]
    }>
  }
  usage: {
    total_tokens: number
  }
}

export interface VectraEmbeddingResult {
  status: 'success' | 'error'
  output?: number[][]
  message?: string
}

function getConfig() {
  const config = useRuntimeConfig()
  return {
    apiKey: (config.embeddingApiKey as string) || (config.qwenApiKey as string) || undefined,
    apiUrl: (config.embeddingApiUrl as string) || 'https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding/text-embedding',
    model: (config.embeddingModel as string) || 'text-embedding-v3'
  }
}

function isOpenAIFormat(url: string): boolean {
  return url.includes('/v1/embeddings') || url.includes('openai')
}

async function fetchEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return []
  }

  const { apiKey, apiUrl, model } = getConfig()

  if (!apiKey) {
    console.error('Embedding API: No API key configured')
    throw createError({
      statusCode: 500,
      message: ERROR_MESSAGES.AI_NOT_CONFIGURED
    })
  }

  console.log('Embedding API: Requesting embeddings for', texts.length, 'texts using model', model)

  const isOpenAI = isOpenAIFormat(apiUrl)
  
  const requestBody = isOpenAI
    ? { model, input: texts }
    : { model, input: { texts }, parameters: { text_type: 'document' } }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Embedding API Error:', response.status, errorText)
    throw createError({
      statusCode: response.status,
      message: `Embedding API failed: ${response.status}`
    })
  }

  const data = await response.json()
  
  if (isOpenAI) {
    const openaiData = data as OpenAIEmbeddingResponse
    if (!openaiData.data || !Array.isArray(openaiData.data) || openaiData.data.length === 0) {
      console.error('Embedding API: No embeddings in response', JSON.stringify(data))
      throw createError({
        statusCode: 500,
        message: 'No embeddings returned from API'
      })
    }
    console.log('Embedding API: Got', openaiData.data.length, 'embeddings')
    return openaiData.data.sort((a, b) => a.index - b.index).map((e) => e.embedding)
  } else {
    const dashscopeData = data as DashScopeEmbeddingResponse
    if (!dashscopeData.output || !Array.isArray(dashscopeData.output.embeddings) || dashscopeData.output.embeddings.length === 0) {
      console.error('Embedding API: No embeddings in response', JSON.stringify(data))
      throw createError({
        statusCode: 500,
        message: 'No embeddings returned from API'
      })
    }
    console.log('Embedding API: Got', dashscopeData.output.embeddings.length, 'embeddings')
    return dashscopeData.output.embeddings.map((e) => e.embedding)
  }
}

export async function getEmbedding(text: string): Promise<number[]> {
  const embeddings = await fetchEmbeddings([text])
  return embeddings[0]
}

export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  return fetchEmbeddings(texts)
}

export function createEmbeddingHandler(): {
  maxTokens: number
  createEmbeddings: (inputs: string | string[]) => Promise<VectraEmbeddingResult>
} {
  return {
    maxTokens: 8000,
    createEmbeddings: async (inputs: string | string[]): Promise<VectraEmbeddingResult> => {
      try {
        const texts = Array.isArray(inputs) ? inputs : [inputs]
        const embeddings = await getEmbeddings(texts)
        return { status: 'success', output: embeddings }
      } catch (error: any) {
        const errorMessage = error?.data?.message || error?.message || error?.statusCode ? `HTTP ${error.statusCode}` : 'Unknown error'
        console.error('Embedding error:', error)
        return {
          status: 'error',
          message: errorMessage
        }
      }
    }
  }
}
