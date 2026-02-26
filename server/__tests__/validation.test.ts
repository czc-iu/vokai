import { describe, it, expect } from 'vitest'
import { registerSchema, loginSchema, contactSchema, chatSchema, validate } from '../utils/validation'

describe('Validation Utils', () => {
  describe('registerSchema', () => {
    it('should validate valid registration data', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      })
      expect(result.success).toBe(true)
    })

    it('should validate without optional name', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'password123'
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const result = registerSchema.safeParse({
        email: 'invalid-email',
        password: 'password123'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('有效的邮箱')
      }
    })

    it('should reject short password', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'short'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('8')
      }
    })

    it('should reject password longer than 100 chars', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'a'.repeat(101)
      })
      expect(result.success).toBe(false)
    })

    it('should reject empty email', () => {
      const result = registerSchema.safeParse({
        email: '',
        password: 'password123'
      })
      expect(result.success).toBe(false)
    })

    it('should reject missing email', () => {
      const result = registerSchema.safeParse({
        password: 'password123'
      })
      expect(result.success).toBe(false)
    })

    it('should reject missing password', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com'
      })
      expect(result.success).toBe(false)
    })

    it('should accept name up to 100 chars', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
        name: 'a'.repeat(100)
      })
      expect(result.success).toBe(true)
    })

    it('should reject name longer than 100 chars', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
        name: 'a'.repeat(101)
      })
      expect(result.success).toBe(false)
    })
  })

  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123'
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty email', () => {
      const result = loginSchema.safeParse({
        email: '',
        password: 'password123'
      })
      expect(result.success).toBe(false)
    })

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: ''
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('请输入密码')
      }
    })

    it('should reject invalid email format', () => {
      const result = loginSchema.safeParse({
        email: 'not-an-email',
        password: 'password123'
      })
      expect(result.success).toBe(false)
    })

    it('should reject missing fields', () => {
      const result = loginSchema.safeParse({})
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThanOrEqual(2)
      }
    })
  })

  describe('contactSchema', () => {
    it('should validate valid contact data', () => {
      const result = contactSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test message'
      })
      expect(result.success).toBe(true)
    })

    it('should validate with all optional fields', () => {
      const result = contactSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        phone: '13800138000',
        company: 'Test Company',
        subject: 'Test Subject',
        message: 'This is a test message'
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty name', () => {
      const result = contactSchema.safeParse({
        name: '',
        email: 'test@example.com',
        message: 'Test message'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('请输入姓名')
      }
    })

    it('should reject empty message', () => {
      const result = contactSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        message: ''
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('请输入留言')
      }
    })

    it('should reject message longer than 2000 chars', () => {
      const result = contactSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        message: 'a'.repeat(2001)
      })
      expect(result.success).toBe(false)
    })

    it('should accept message exactly 2000 chars', () => {
      const result = contactSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        message: 'a'.repeat(2000)
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid email in contact', () => {
      const result = contactSchema.safeParse({
        name: 'Test User',
        email: 'bad-email',
        message: 'Test message'
      })
      expect(result.success).toBe(false)
    })

    it('should reject phone longer than 20 chars', () => {
      const result = contactSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        phone: '1'.repeat(21),
        message: 'Test message'
      })
      expect(result.success).toBe(false)
    })

    it('should reject company longer than 100 chars', () => {
      const result = contactSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        company: 'a'.repeat(101),
        message: 'Test message'
      })
      expect(result.success).toBe(false)
    })
  })

  describe('chatSchema', () => {
    it('should validate valid chat message', () => {
      const result = chatSchema.safeParse({
        message: 'Hello, how are you?'
      })
      expect(result.success).toBe(true)
    })

    it('should validate with conversationId', () => {
      const result = chatSchema.safeParse({
        message: 'Hello!',
        conversationId: 123
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty message', () => {
      const result = chatSchema.safeParse({
        message: ''
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('请输入消息')
      }
    })

    it('should reject message longer than 4000 chars', () => {
      const result = chatSchema.safeParse({
        message: 'a'.repeat(4001)
      })
      expect(result.success).toBe(false)
    })

    it('should accept message exactly 4000 chars', () => {
      const result = chatSchema.safeParse({
        message: 'a'.repeat(4000)
      })
      expect(result.success).toBe(true)
    })

    it('should reject missing message field', () => {
      const result = chatSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })

  describe('validate function', () => {
    it('should return success for valid data', () => {
      const result = validate(loginSchema, {
        email: 'test@example.com',
        password: 'password123'
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual({
          email: 'test@example.com',
          password: 'password123'
        })
      }
    })

    it('should return error for invalid data', () => {
      const result = validate(loginSchema, {
        email: 'invalid',
        password: ''
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
        expect(typeof result.error).toBe('string')
      }
    })

    it('should return first error message only', () => {
      const result = validate(registerSchema, {
        email: '',
        password: ''
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })
  })
})
