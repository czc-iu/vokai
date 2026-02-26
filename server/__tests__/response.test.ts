import { describe, it, expect, vi } from 'vitest'
import { ERROR_MESSAGES } from '../utils/constants'
import { 
  successResponse, 
  errorResponse, 
  throwBadRequest, 
  throwUnauthorized, 
  throwNotFound, 
  throwConflict, 
  throwMethodNotAllowed,
  assertPostMethod 
} from '../utils/response'

vi.stubGlobal('createError', (opts: { statusCode: number; message: string }) => {
  const error = new Error(opts.message)
  ;(error as unknown as { statusCode: number }).statusCode = opts.statusCode
  return error
})

describe('Response Utils', () => {
  describe('successResponse', () => {
    it('should return success response with data', () => {
      const data = { id: 1, name: 'test' }
      const result = successResponse(data)
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual(data)
    })

    it('should return success response with null data', () => {
      const result = successResponse(null)
      
      expect(result.success).toBe(true)
      expect(result.data).toBeNull()
    })

    it('should return success response with array data', () => {
      const data = [{ id: 1 }, { id: 2 }]
      const result = successResponse(data)
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual(data)
    })
  })

  describe('errorResponse', () => {
    it('should return error response with message', () => {
      const result = errorResponse('Validation failed')
      
      expect(result.success).toBe(false)
      expect(result.message).toBe('Validation failed')
    })
  })

  describe('throwBadRequest', () => {
    it('should throw error with 400 status code', () => {
      expect(() => throwBadRequest('Invalid input')).toThrow('Invalid input')
    })
  })

  describe('throwUnauthorized', () => {
    it('should throw error with 401 status code and default message', () => {
      expect(() => throwUnauthorized()).toThrow(ERROR_MESSAGES.AUTH_REQUIRED)
    })

    it('should throw error with 401 status code and custom message', () => {
      expect(() => throwUnauthorized('Custom message')).toThrow('Custom message')
    })
  })

  describe('throwNotFound', () => {
    it('should throw error with 404 status code', () => {
      expect(() => throwNotFound('User not found')).toThrow('User not found')
    })
  })

  describe('throwConflict', () => {
    it('should throw error with 409 status code', () => {
      expect(() => throwConflict('Email exists')).toThrow('Email exists')
    })
  })

  describe('throwMethodNotAllowed', () => {
    it('should throw error with 405 status code', () => {
      expect(() => throwMethodNotAllowed()).toThrow(ERROR_MESSAGES.METHOD_NOT_ALLOWED)
    })
  })

  describe('assertPostMethod', () => {
    it('should not throw for POST method', () => {
      expect(() => assertPostMethod('POST')).not.toThrow()
    })

    it('should throw for GET method', () => {
      expect(() => assertPostMethod('GET')).toThrow()
    })

    it('should throw for PUT method', () => {
      expect(() => assertPostMethod('PUT')).toThrow()
    })
  })
})
