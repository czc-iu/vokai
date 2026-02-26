import type { LoginInput } from '../../utils/validation'
import { validate, loginSchema } from '../../utils/validation'
import { comparePassword, generateToken } from '../../utils/auth'
import { queryOne, update } from '../../utils/db'
import { successResponse, throwBadRequest, throwUnauthorized } from '../../utils/response'
import { ERROR_MESSAGES } from '../../utils/constants'

interface DbUser {
  id: number
  email: string
  password_hash: string
  name: string | null
  status: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const validation = validate(loginSchema, body)
  if (!validation.success) {
    throwBadRequest(validation.error)
  }

  const { email, password } = validation.data as LoginInput

  const user = await queryOne<DbUser>(
    'SELECT id, email, password_hash, name, status FROM users WHERE email = ?',
    [email]
  )

  if (!user) {
    throwUnauthorized(ERROR_MESSAGES.LOGIN_FAILED)
  }

  if (user.status !== 'active') {
    throwUnauthorized(ERROR_MESSAGES.ACCOUNT_DISABLED)
  }

  const isValidPassword = await comparePassword(password, user.password_hash)
  
  if (!isValidPassword) {
    throwUnauthorized(ERROR_MESSAGES.LOGIN_FAILED)
  }

  await update('users', { last_login_at: new Date() }, 'id = ?', [user.id])

  const token = generateToken({
    userId: user.id,
    email: user.email
  })

  return successResponse({
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    },
    token
  })
})
