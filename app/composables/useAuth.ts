interface User {
  id: number
  email: string
  name: string | null
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
}

interface AuthResponse {
  success: boolean
  data?: {
    user: User
    token: string
  }
  message?: string
}

interface MeResponse {
  success: boolean
  data?: User
}

// Use a reactive object instead of useState at module level
const state = reactive<AuthState>({
  user: null,
  token: null,
  loading: false
})

function getToken(): string | null {
  if (!import.meta.client) return null
  return localStorage.getItem('auth_token')
}

function setToken(token: string): void {
  if (!import.meta.client) return
  localStorage.setItem('auth_token', token)
}

function removeToken(): void {
  if (!import.meta.client) return
  localStorage.removeItem('auth_token')
}

export function useAuth() {
  const login = async (email: string, password: string): Promise<AuthResponse> => {
    state.loading = true
    try {
      const response = await $fetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })
      
      if (response.success && response.data) {
        state.user = response.data.user
        state.token = response.data.token
        setToken(response.data.token)
      }
      return response
    } finally {
      state.loading = false
    }
  }

  const register = async (email: string, password: string, name?: string): Promise<AuthResponse> => {
    state.loading = true
    try {
      const response = await $fetch<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: { email, password, name }
      })
      
      if (response.success && response.data) {
        state.user = response.data.user
        state.token = response.data.token
        setToken(response.data.token)
      }
      return response
    } finally {
      state.loading = false
    }
  }

  const logout = (): void => {
    state.user = null
    state.token = null
    removeToken()
  }

  const fetchUser = async (): Promise<void> => {
    const token = getToken()
    if (!token) return

    state.token = token
    state.loading = true
    try {
      const response = await $fetch<MeResponse>('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.success && response.data) {
        state.user = response.data
      }
    } catch {
      state.user = null
      state.token = null
      removeToken()
    } finally {
      state.loading = false
    }
  }

  const getAuthHeaders = (): Record<string, string> => {
    if (!state.token) return {}
    return { Authorization: `Bearer ${state.token}` }
  }

  return {
    state: toRef(() => state),
    login,
    register,
    logout,
    fetchUser,
    getAuthHeaders
  }
}

export function useUser() {
  return computed(() => state.user)
}
