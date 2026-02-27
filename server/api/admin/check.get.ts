import { requireAuth } from '../../utils/auth'
import { queryOne } from '../../utils/db'
import { successResponse, errorResponse } from '../../utils/response'

interface DbAdmin {
  id: number
  user_id: number
  role: string
  status: string
}

export default defineEventHandler(async (event) => {
  try {
    const auth = requireAuth(event)
    
    const admin = await queryOne<DbAdmin>(
      `SELECT id, user_id, role, status 
       FROM admins 
       WHERE user_id = ? AND status = 'active'`,
      [auth.userId]
    )
    
    if (admin) {
      return successResponse({
        isAdmin: true,
        role: admin.role
      })
    }
    
    return successResponse({
      isAdmin: false
    })
  } catch (error: any) {
    return errorResponse(error.message || '检查管理员权限失败')
  }
})
