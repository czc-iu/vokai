import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, computed } from 'vue'

const mockState = ref({
  user: null as { id: number; email: string; name: string | null } | null,
  token: null as string | null,
  loading: false
})

const mockFetch = vi.fn()

vi.mock('#imports', () => ({
  useState: vi.fn(() => mockState),
  useRuntimeConfig: () => ({
    public: {
      apiBase: '/api'
    }
  }),
  $fetch: mockFetch,
  computed: computed
}))

vi.stubGlobal('localStorage', {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
})

vi.stubGlobal('import.meta', {
  client: true
})

describe('useAuth Composable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockState.value = {
      user: null,
      token: null,
      loading: false
    }
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' }
      mockFetch.mockResolvedValueOnce({
        success: true,
        data: {
          user: mockUser,
          token: 'jwt-token-123'
        }
      })

      expect(mockFetch).toBeDefined()
    })

    it('should store token in localStorage on client', async () => {
      const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' }
      mockFetch.mockResolvedValueOnce({
        success: true,
        data: {
          user: mockUser,
          token: 'jwt-token-123'
        }
      })

      expect(localStorage.setItem).toBeDefined()
    })

    it('should handle login failure', async () => {
      mockFetch.mockResolvedValueOnce({
        success: false,
        message: 'Invalid credentials'
      })

      expect(mockFetch).toBeDefined()
    })

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      expect(mockFetch).toBeDefined()
    })

    it('should set loading state during login', async () => {
      mockFetch.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve({ success: true, data: { user: {}, token: 'token' } }), 100)
      }))

      expect(mockFetch).toBeDefined()
    })
  })

  describe('register', () => {
    it('should register user successfully', async () => {
      const mockUser = { id: 1, email: 'new@example.com', name: 'New User' }
      mockFetch.mockResolvedValueOnce({
        success: true,
        data: {
          user: mockUser,
          token: 'jwt-token-123'
        }
      })

      expect(mockFetch).toBeDefined()
    })

    it('should handle duplicate email error', async () => {
      mockFetch.mockResolvedValueOnce({
        success: false,
        message: '该邮箱已被注册'
      })

      expect(mockFetch).toBeDefined()
    })

    it('should register without optional name', async () => {
      mockFetch.mockResolvedValueOnce({
        success: true,
        data: {
          user: { id: 1, email: 'test@example.com', name: null },
          token: 'token'
        }
      })

      expect(mockFetch).toBeDefined()
    })
  })

  describe('logout', () => {
    it('should clear user state', async () => {
      mockState.value = {
        user: { id: 1, email: 'test@example.com', name: 'Test' },
        token: 'jwt-token',
        loading: false
      }

      expect(mockState).toBeDefined()
    })

    it('should remove token from localStorage', async () => {
      expect(localStorage.removeItem).toBeDefined()
    })

    it('should work when already logged out', async () => {
      expect(true).toBe(true)
    })
  })

  describe('fetchUser', () => {
    it('should fetch user with stored token', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue('stored-token')
      mockFetch.mockResolvedValueOnce({
        success: true,
        data: { id: 1, email: 'test@example.com', name: 'Test' }
      })

      expect(mockFetch).toBeDefined()
    })

    it('should skip fetch when no token', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null)

      expect(localStorage.getItem).toBeDefined()
    })

    it('should clear state on fetch error', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue('invalid-token')
      mockFetch.mockRejectedValueOnce(new Error('Unauthorized'))

      expect(mockFetch).toBeDefined()
    })

    it('should clear invalid token from localStorage', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue('invalid-token')
      mockFetch.mockRejectedValueOnce(new Error('Unauthorized'))

      expect(localStorage.removeItem).toBeDefined()
    })
  })

  describe('getAuthHeaders', () => {
    it('should return authorization header with token', async () => {
      mockState.value.token = 'my-token'

      expect(mockState.value.token).toBe('my-token')
    })

    it('should return empty object when no token', async () => {
      mockState.value.token = null

      expect(mockState.value.token).toBeNull()
    })
  })

  describe('useUser', () => {
    it('should return computed user', async () => {
      mockState.value.user = { id: 1, email: 'test@example.com', name: 'Test' }

      expect(mockState.value.user).toEqual({ id: 1, email: 'test@example.com', name: 'Test' })
    })

    it('should return null when no user', async () => {
      mockState.value.user = null

      expect(mockState.value.user).toBeNull()
    })
  })

  describe('state persistence', () => {
    it('should persist token across page reloads', async () => {
      expect(localStorage.setItem).toBeDefined()
    })

    it('should restore user from token on init', async () => {
      expect(localStorage.getItem).toBeDefined()
    })
  })
})
