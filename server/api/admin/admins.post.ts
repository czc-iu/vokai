import { requireSuperAdmin, logAdminAction } from '../../utils/adminAuth'
import { queryOne, insert } from '../../utils/db'
import { successResponse, throwBadRequest, throwConflict } from '../../utils/response'

export default defineEventHandler(async (event) => {
  const admin = await requireSuperAdmin(event)
  const body = await readBody(event)
  
  const { userId, role = 'admin', permissions = [] } = body
  
  if (!userId) {
    throwBadRequest('用户ID不能为空')
  }
  
  // 检查用户是否存在
  const user = await queryOne<{ id: number; email: string }>(
    'SELECT id, email FROM users WHERE id = ?',
    [userId]
  )
  
  if (!user) {
    throwBadRequest('用户不存在')
  }
  
  // 检查是否已经是管理员
  const existingAdmin = await queryOne<{ id: number }>(
    'SELECT id FROM admins WHERE user_id = ?',
    [userId]
  )
  
  if (existingAdmin) {
    throwConflict('该用户已经是管理员')
  }
  
  // 创建管理员
  const result = await insert('admins', {
    user_id: userId,
    role,
    permissions: JSON.stringify(permissions),
    status: 'active'
  })
  
  // 记录操作日志
  await logAdminAction(
    admin.adminId,
    'create_admin',
    { userId, role, permissions },
    'admin',
    result.insertId
  )
  
  return successResponse({
    message: '管理员创建成功',
    admin: {
      id: result.insertId,
      userId,
      role,
      permissions
    }
  })
})
