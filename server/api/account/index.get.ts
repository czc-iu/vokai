import { requireAuth } from '../../utils/auth'
import { queryOne } from '../../utils/db'
import { successResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)

  const user = await queryOne<{
    id: number
    email: string
    name: string | null
    phone: string | null
    phone_verified: boolean
    avatar: string | null
    company: string | null
    status: string
    email_verified: boolean
    created_at: Date
  }>(
    `SELECT id, email, name, phone, phone_verified, avatar, company, status, email_verified, created_at 
     FROM users WHERE id = ?`,
    [auth.userId]
  )

  if (!user) {
    return successResponse(null)
  }

  const balance = await queryOne<{ balance: number }>(
    'SELECT balance FROM token_balances WHERE user_id = ?',
    [auth.userId]
  )

  return successResponse({
    ...user,
    tokenBalance: balance?.balance || 0
  })
})
