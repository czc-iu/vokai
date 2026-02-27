import { requireSuperAdmin, logAdminAction } from '../../../utils/adminAuth'
import { queryOne, remove } from '../../../utils/db'
import { successResponse, errorResponse, throwNotFound } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  const admin = await requireSuperAdmin(event)

  const id = parseInt(getRouterParam(event, 'id') || '0')
  if (!id) {
    throwNotFound('管理员不存在')
  }

  const existingAdmin = await queryOne<{
    id: number
    user_id: number
    role: string
  }>(
    'SELECT id, user_id, role FROM admins WHERE id = ?',
    [id]
  )

  if (!existingAdmin) {
    throwNotFound('管理员不存在')
  }

  if (existingAdmin.role === 'super_admin') {
    return errorResponse('不能删除超级管理员')
  }

  await remove('admins', 'id = ?', [id])

  await logAdminAction(
    admin.adminId,
    'delete_admin',
    { deletedAdminId: id, deletedUserId: existingAdmin.user_id },
    'admin',
    id
  )

  return successResponse({ message: '删除成功' })
})
