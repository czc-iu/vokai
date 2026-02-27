import { requireAdmin } from '../../utils/adminAuth'
import { query } from '../../utils/db'
import { successResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  
  const admins = await query<
    Array<{
      id: number
      user_id: number
      email: string
      name: string | null
      role: string
      permissions: string | null
      status: string
      last_login_at: Date | null
      created_at: Date
    }>
  >(
    `SELECT 
      a.id,
      a.user_id,
      u.email,
      u.name,
      a.role,
      a.permissions,
      a.status,
      a.last_login_at,
      a.created_at
    FROM admins a
    JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC`
  )
  
  const formattedAdmins = admins.map(admin => ({
    ...admin,
    permissions: typeof admin.permissions === 'string' 
      ? JSON.parse(admin.permissions) 
      : (admin.permissions || [])
  }))
  
  return successResponse({
    admins: formattedAdmins,
    total: formattedAdmins.length
  })
})
