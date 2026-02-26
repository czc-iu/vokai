import type { RegisterInput } from '../../utils/validation'
import { validate, registerSchema } from '../../utils/validation'
import { hashPassword, generateToken } from '../../utils/auth'
import { queryOne, insert } from '../../utils/db'
import { successResponse, throwBadRequest, throwConflict } from '../../utils/response'
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
  
  const validation = validate(registerSchema, body)
  if (!validation.success) {
    throwBadRequest(validation.error)
  }

  const { email, password, name } = validation.data as RegisterInput

  const existingUser = await queryOne<DbUser>(
    'SELECT id FROM users WHERE email = ?',
    [email]
  )

  if (existingUser) {
    throwConflict(ERROR_MESSAGES.EMAIL_EXISTS)
  }

  const passwordHash = await hashPassword(password)

  const result = await insert('users', {
    email,
    password_hash: passwordHash,
    name: name || null,
    status: 'active',
    email_verified: false
  })

  const userId = result.insertId
  
  const token = generateToken({
    userId,
    email
  })

  return successResponse({
    user: {
      id: userId,
      email,
      name: name || null
    },
    token
  })
})
