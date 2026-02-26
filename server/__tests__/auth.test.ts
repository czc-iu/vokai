import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn()
  }
}))

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn()
  }
}))

const mockConfig = {
  jwtSecret: 'test-secret',
  jwtExpiresIn: '7d'
}

vi.stubGlobal('useRuntimeConfig', () => mockConfig)

describe('Auth Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('hashPassword', () => {
    it('should hash password with salt rounds of 12', async () => {
      const mockHash = '$2a$12$hashedpassword'
      vi.mocked(bcrypt.hash).mockResolvedValue(mockHash as never)

      const { hashPassword } = await import('../utils/auth')
      const result = await hashPassword('mypassword')

      expect(bcrypt.hash).toHaveBeenCalledWith('mypassword', 12)
      expect(result).toBe(mockHash)
    })

    it('should handle empty password', async () => {
      const mockHash = '$2a$12$hashedempty'
      vi.mocked(bcrypt.hash).mockResolvedValue(mockHash as never)

      const { hashPassword } = await import('../utils/auth')
      const result = await hashPassword('')

      expect(bcrypt.hash).toHaveBeenCalledWith('', 12)
      expect(result).toBe(mockHash)
    })
  })

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never)

      const { comparePassword } = await import('../utils/auth')
      const result = await comparePassword('password123', '$2a$12$hash')

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', '$2a$12$hash')
      expect(result).toBe(true)
    })

    it('should return false for non-matching password', async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

      const { comparePassword } = await import('../utils/auth')
      const result = await comparePassword('wrongpassword', '$2a$12$hash')

      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', '$2a$12$hash')
      expect(result).toBe(false)
    })
  })

  describe('generateToken', () => {
    it('should generate JWT token with correct payload', async () => {
      const mockToken = 'generated.jwt.token'
      vi.mocked(jwt.sign).mockReturnValue(mockToken as never)

      const { generateToken } = await import('../utils/auth')
      const payload = { userId: 1, email: 'test@example.com' }
      const result = generateToken(payload)

      expect(jwt.sign).toHaveBeenCalledWith(
        payload,
        'test-secret',
        { expiresIn: '7d' }
      )
      expect(result).toBe(mockToken)
    })
  })

  describe('verifyToken', () => {
    it('should return decoded payload for valid token', async () => {
      const mockPayload = { userId: 1, email: 'test@example.com', iat: 123456, exp: 123456 }
      vi.mocked(jwt.verify).mockReturnValue(mockPayload as never)

      const { verifyToken } = await import('../utils/auth')
      const result = verifyToken('valid.token.here')

      expect(jwt.verify).toHaveBeenCalledWith('valid.token.here', 'test-secret')
      expect(result).toEqual(mockPayload)
    })

    it('should return null for invalid token', async () => {
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const { verifyToken } = await import('../utils/auth')
      const result = verifyToken('invalid.token')

      expect(result).toBeNull()
    })

    it('should return null for expired token', async () => {
      vi.mocked(jwt.verify).mockImplementation(() => {
        const error = new Error('Token expired')
        error.name = 'TokenExpiredError'
        throw error
      })

      const { verifyToken } = await import('../utils/auth')
      const result = verifyToken('expired.token')

      expect(result).toBeNull()
    })
  })

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer header', async () => {
      const { extractTokenFromHeader } = await import('../utils/auth')
      
      const result = extractTokenFromHeader('Bearer mytoken123')
      expect(result).toBe('mytoken123')
    })

    it('should return null for undefined header', async () => {
      const { extractTokenFromHeader } = await import('../utils/auth')
      
      const result = extractTokenFromHeader(undefined)
      expect(result).toBeNull()
    })

    it('should return null for empty string header', async () => {
      const { extractTokenFromHeader } = await import('../utils/auth')
      
      const result = extractTokenFromHeader('')
      expect(result).toBeNull()
    })

    it('should return null for non-Bearer header', async () => {
      const { extractTokenFromHeader } = await import('../utils/auth')
      
      const result = extractTokenFromHeader('Basic mytoken123')
      expect(result).toBeNull()
    })

    it('should return null for header without space after Bearer', async () => {
      const { extractTokenFromHeader } = await import('../utils/auth')
      
      const result = extractTokenFromHeader('Bearer')
      expect(result).toBeNull()
    })
  })

  describe('generateRefreshToken', () => {
    it('should generate 64 character token', async () => {
      const { generateRefreshToken } = await import('../utils/auth')
      
      const token = generateRefreshToken()
      expect(token).toHaveLength(64)
    })

    it('should generate unique tokens', async () => {
      const { generateRefreshToken } = await import('../utils/auth')
      
      const token1 = generateRefreshToken()
      const token2 = generateRefreshToken()
      expect(token1).not.toBe(token2)
    })

    it('should only contain alphanumeric characters', async () => {
      const { generateRefreshToken } = await import('../utils/auth')
      
      const token = generateRefreshToken()
      expect(token).toMatch(/^[A-Za-z0-9]+$/)
    })
  })
})
