import { QWEN_DEFAULT_MODEL, QWEN_DEFAULT_TEMPERATURE, QWEN_DEFAULT_MAX_TOKENS, ERROR_MESSAGES } from './constants'

export interface QwenMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  name?: string
  tool_call_id?: string
}

export interface ToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

export interface XmlToolCall {
  name: string
  parameters: Record<string, string>
}

export function parseXmlToolCalls(content: string): XmlToolCall[] {
  const toolCalls: XmlToolCall[] = []
  
  const invokeRegex = /<invoke\s+name=["']([^"']+)["'][^>]*>([\s\S]*?)<\/invoke>/gi
  let match
  
  while ((match = invokeRegex.exec(content)) !== null) {
    const name = match[1]
    const paramsBlock = match[2]
    
    const parameters: Record<string, string> = {}
    const paramRegex = /<parameter\s+name=["']([^"']+)["'][^>]*>([\s\S]*?)<\/parameter>/gi
    let paramMatch
    
    while ((paramMatch = paramRegex.exec(paramsBlock)) !== null) {
      parameters[paramMatch[1]] = paramMatch[2].trim()
    }
    
    toolCalls.push({ name, parameters })
  }
  
  return toolCalls
}

export function hasXmlToolCalls(content: string): boolean {
  return /<invoke\s+name=/i.test(content)
}

export interface QwenResponse {
  id: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string | null
      reasoning_content?: string
      tool_calls?: ToolCall[]
    }
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface QwenStreamChunk {
  id: string
  choices: Array<{
    index: number
    delta: {
      role?: string
      content?: string
      reasoning_content?: string
      tool_calls?: Partial<ToolCall>[]
    }
    finish_reason: string | null
  }>
}

export interface Tool {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

export interface ChatOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  enableSearch?: boolean
  enableThinking?: boolean
  tools?: Tool[]
  additionalSystemPrompt?: string
}

export interface ChatResult {
  content: string
  reasoningContent?: string
  toolCalls?: ToolCall[]
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

interface StreamChunk {
  content?: string
  reasoningContent?: string
  toolCalls?: Partial<ToolCall>[]
  done: boolean
}

interface ApiConfig {
  apiKey: string | undefined
  apiUrl: string
  model: string
  systemPrompt: string
}

function getApiConfig(): ApiConfig {
  const config = useRuntimeConfig()
  return {
    apiKey: config.qwenApiKey,
    apiUrl: config.qwenApiUrl as string,
    model: config.qwenModel || QWEN_DEFAULT_MODEL,
    systemPrompt: config.qwenSystemPrompt as string
  }
}

function buildRequestBody(
  messages: QwenMessage[],
  options: ChatOptions,
  systemPrompt: string,
  defaultModel: string,
  stream = false
): Record<string, unknown> {
  let finalSystemPrompt = systemPrompt
  if (options.additionalSystemPrompt) {
    finalSystemPrompt = systemPrompt + '\n\n' + options.additionalSystemPrompt
  }
  
  const body: Record<string, unknown> = {
    model: options.model || defaultModel,
    messages: [{ role: 'system', content: finalSystemPrompt }, ...messages],
    temperature: options.temperature ?? QWEN_DEFAULT_TEMPERATURE,
    max_tokens: options.maxTokens ?? QWEN_DEFAULT_MAX_TOKENS,
    stream
  }

  if (options.enableSearch) body.enable_search = true
  if (options.enableThinking) body.enable_thinking = true
  if (options.tools?.length) body.tools = options.tools

  return body
}

function buildHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
}

function throwApiError(statusCode: number, message: string): never {
  throw createError({ statusCode, message })
}

function parseResponseUsage(data: QwenResponse): ChatResult['usage'] {
  if (!data.usage) return undefined
  return {
    promptTokens: data.usage.prompt_tokens,
    completionTokens: data.usage.completion_tokens,
    totalTokens: data.usage.total_tokens
  }
}

function parseStreamLine(line: string): StreamChunk | null {
  if (!line.startsWith('data:')) return null

  const data = line.slice(5).trim()
  if (data === '[DONE]') return { done: true }

  try {
    const parsed = JSON.parse(data) as QwenStreamChunk
    const delta = parsed.choices[0]?.delta

    if (!delta) return null

    return {
      content: delta.content,
      reasoningContent: delta.reasoning_content,
      toolCalls: delta.tool_calls,
      done: false
    }
  } catch {
    return null
  }
}

async function makeApiRequest(
  apiUrl: string,
  apiKey: string,
  body: Record<string, unknown>
): Promise<Response> {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: buildHeaders(apiKey),
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Qwen API Error:', errorText)
    throwApiError(response.status, ERROR_MESSAGES.AI_REQUEST_FAILED)
  }

  return response
}

export async function chatWithQwen(
  messages: QwenMessage[],
  options: ChatOptions = {}
): Promise<ChatResult> {
  const { apiKey, apiUrl, model, systemPrompt } = getApiConfig()
  
  if (!apiKey) {
    console.error('AI API Error: API key not configured')
    throw createError({
      statusCode: 500,
      message: ERROR_MESSAGES.AI_NOT_CONFIGURED
    })
  }

  try {
    const body = buildRequestBody(messages, options, systemPrompt, model)
    const response = await makeApiRequest(apiUrl, apiKey, body)
    const data = (await response.json()) as QwenResponse
    const message = data.choices[0]?.message

    return {
      content: message?.content || '',
      reasoningContent: message?.reasoning_content,
      toolCalls: message?.tool_calls,
      usage: parseResponseUsage(data)
    }
  } catch (error: unknown) {
    console.error('AI API Error:', error)
    
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    
    const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.AI_UNAVAILABLE
    throw createError({
      statusCode: 500,
      message: errorMessage
    })
  }
}

async function* processStreamChunks(reader: ReadableStreamDefaultReader<Uint8Array>): AsyncGenerator<StreamChunk> {
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const chunk = parseStreamLine(line)
      if (!chunk) continue

      if (chunk.done) {
        yield chunk
        return
      }
      yield chunk
    }
  }

  yield { done: true }
}

export async function* streamChatWithQwen(
  messages: QwenMessage[],
  options: ChatOptions = {}
): AsyncGenerator<StreamChunk, void, unknown> {
  const { apiKey, apiUrl, model, systemPrompt } = getApiConfig()
  
  if (!apiKey) {
    console.error('AI API Error: API key not configured')
    throw createError({
      statusCode: 500,
      message: ERROR_MESSAGES.AI_NOT_CONFIGURED
    })
  }

  try {
    const body = buildRequestBody(messages, options, systemPrompt, model, true)
    const response = await makeApiRequest(apiUrl, apiKey, body)

    const reader = response.body?.getReader()
    if (!reader) {
      throw createError({
        statusCode: 500,
        message: ERROR_MESSAGES.AI_STREAM_UNAVAILABLE
      })
    }

    yield* processStreamChunks(reader)
  } catch (error: unknown) {
    console.error('AI API Error:', error)
    
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    
    const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.AI_UNAVAILABLE
    throw createError({
      statusCode: 500,
      message: errorMessage
    })
  }
}

export async function chatWithTools(
  messages: QwenMessage[],
  tools: Tool[],
  executeTool: (name: string, args: Record<string, unknown>) => Promise<string>,
  options: ChatOptions = {},
  maxIterations = 5
): Promise<ChatResult> {
  const conversationMessages = [...messages]
  let iterations = 0
  let lastResult: ChatResult = { content: '' }

  while (iterations < maxIterations) {
    lastResult = await chatWithQwen(conversationMessages, { ...options, tools })

    if (!lastResult.toolCalls?.length) return lastResult

    conversationMessages.push({
      role: 'assistant',
      content: lastResult.content || '',
      tool_calls: lastResult.toolCalls as unknown as undefined
    } as unknown as QwenMessage)

    for (const toolCall of lastResult.toolCalls) {
      const args = JSON.parse(toolCall.function.arguments) as Record<string, unknown>
      const result = await executeTool(toolCall.function.name, args)

      conversationMessages.push({
        role: 'tool',
        content: result,
        tool_call_id: toolCall.id
      })
    }

    iterations++
  }

  return lastResult
}
