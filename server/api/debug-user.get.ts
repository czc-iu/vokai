import { query } from '../utils/db'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async () => {
  const users = await query<{
    id: number
    email: string
    password_hash: string
    name: string | null
    status: string
  }[]>(
    'SELECT id, email, password_hash, name, status FROM users LIMIT 10'
  )
  
  return {
    totalUsers: users.length,
    users: users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      status: u.status,
      hashLength: u.password_hash?.length || 0
    }))
  }
})
