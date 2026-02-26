import { requireAuth } from './auth'
import { queryOne } from './db'
import { throwForbidden } from './response'

interface DbUser {
  id: number
  email: string
  name: string | null
  role: 'user' | 'admin'
}

export async function requireAdmin(event: any): Promise<{ userId: number; email: string; name: string | null }> {
  const auth = requireAuth(event)
  
  const user = await queryOne<DbUser>(
    'SELECT id, email, name, role FROM users WHERE id = ?',
    [auth.userId]
  )

  if (!user || user.role !== 'admin') {
    throwForbidden('需要管理员权限')
  }

  return {
    userId: user.id,
    email: user.email,
    name: user.name
  }
}
