import { requireAuth } from '../../utils/auth'
import { queryOne } from '../../utils/db'
import { successResponse, throwNotFound } from '../../utils/response'
import { ERROR_MESSAGES } from '../../utils/constants'

interface DbUser {
  id: number
  email: string
  name: string | null
  avatar: string | null
  status: string
  created_at: Date
}

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)

  const user = await queryOne<DbUser>(
    'SELECT id, email, name, avatar, status, created_at FROM users WHERE id = ?',
    [auth.userId]
  )

  if (!user) {
    throwNotFound(ERROR_MESSAGES.USER_NOT_FOUND)
  }

  return successResponse({
    id: user!.id,
    email: user!.email,
    name: user!.name,
    avatar: user!.avatar,
    status: user!.status,
    createdAt: user!.created_at
  })
})
