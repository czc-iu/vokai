import { ERROR_MESSAGES, HTTP_STATUS } from './constants'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
}

export interface UserData {
  id: number
  email: string
  name: string | null
}

export interface ConversationData {
  id: number
  title: string
  createdAt: Date
  updatedAt: Date
}

export interface MessageData {
  id: number
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
}

export function successResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data }
}

export function errorResponse(message: string): ApiResponse {
  return { success: false, message }
}

export function throwBadRequest(message: string): never {
  throw createError({
    statusCode: HTTP_STATUS.BAD_REQUEST,
    message
  })
}

export function throwUnauthorized(message: string = ERROR_MESSAGES.AUTH_REQUIRED): never {
  throw createError({
    statusCode: HTTP_STATUS.UNAUTHORIZED,
    message
  })
}

export function throwNotFound(message: string): never {
  throw createError({
    statusCode: HTTP_STATUS.NOT_FOUND,
    message
  })
}

export function throwConflict(message: string): never {
  throw createError({
    statusCode: HTTP_STATUS.CONFLICT,
    message
  })
}

export function throwForbidden(message: string = '禁止访问'): never {
  throw createError({
    statusCode: HTTP_STATUS.FORBIDDEN,
    message
  })
}

export function throwMethodNotAllowed(): never {
  throw createError({
    statusCode: HTTP_STATUS.METHOD_NOT_ALLOWED,
    message: ERROR_MESSAGES.METHOD_NOT_ALLOWED
  })
}

export function assertPostMethod(method: string): void {
  if (method !== 'POST') {
    throwMethodNotAllowed()
  }
}
