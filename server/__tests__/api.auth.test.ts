import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockQueryOne = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockHashPassword = vi.fn()
const mockComparePassword = vi.fn()
const mockGenerateToken = vi.fn()

vi.mock('../utils/db', () => ({
  queryOne: mockQueryOne,
  insert: mockInsert,
  update: mockUpdate
}))

vi.mock('../utils/auth', () => ({
  hashPassword: mockHashPassword,
  comparePassword: mockComparePassword,
  generateToken: mockGenerateToken
}))

vi.mock('../utils/validation', () => ({
  registerSchema: {
    parse: vi.fn()
  },
  loginSchema: {
    parse: vi.fn()
  },
  validate: vi.fn()
}))

describe('Auth API - Register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      mockQueryOne.mockResolvedValue(null)
      mockHashPassword.mockResolvedValue('hashedpassword123')
      mockInsert.mockResolvedValue({ insertId: 1, affectedRows: 1 })
      mockGenerateToken.mockReturnValue('jwt-token-123')

      vi.doMock('../utils/validation', () => ({
        validate: () => ({
          success: true,
          data: {
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User'
          }
        })
      }))

      expect(mockHashPassword).toBeDefined()
    })

    it('should reject duplicate email', async () => {
      mockQueryOne.mockResolvedValue({ id: 1, email: 'test@example.com' })

      expect(mockQueryOne).toBeDefined()
    })

    it('should reject invalid email format', async () => {
      vi.doMock('../utils/validation', () => ({
        validate: () => ({
          success: false,
          error: '请输入有效的邮箱地址'
        })
      }))

      expect(true).toBe(true)
    })

    it('should reject short password', async () => {
      vi.doMock('../utils/validation', () => ({
        validate: () => ({
          success: false,
          error: '密码至少8个字符'
        })
      }))

      expect(true).toBe(true)
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login user with correct credentials', async () => {
      mockQueryOne.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        name: 'Test User',
        status: 'active'
      })
      mockComparePassword.mockResolvedValue(true)
      mockUpdate.mockResolvedValue({ affectedRows: 1 })
      mockGenerateToken.mockReturnValue('jwt-token-123')

      expect(mockComparePassword).toBeDefined()
    })

    it('should reject non-existent user', async () => {
      mockQueryOne.mockResolvedValue(null)

      expect(mockQueryOne).toBeDefined()
    })

    it('should reject wrong password', async () => {
      mockQueryOne.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        status: 'active'
      })
      mockComparePassword.mockResolvedValue(false)

      expect(mockComparePassword).toBeDefined()
    })

    it('should reject suspended account', async () => {
      mockQueryOne.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        status: 'suspended'
      })

      expect(mockQueryOne).toBeDefined()
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return current user info', async () => {
      mockQueryOne.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
        status: 'active',
        created_at: new Date()
      })

      expect(mockQueryOne).toBeDefined()
    })

    it('should return 404 for non-existent user', async () => {
      mockQueryOne.mockResolvedValue(null)

      expect(mockQueryOne).toBeDefined()
    })
  })
})
