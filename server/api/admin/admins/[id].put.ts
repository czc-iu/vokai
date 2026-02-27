import { requireSuperAdmin, logAdminAction } from '../../../utils/adminAuth'
import { queryOne, update } from '../../../utils/db'
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
    permissions: string | null
  }>(
    'SELECT id, user_id, role, permissions FROM admins WHERE id = ?',
    [id]
  )

  if (!existingAdmin) {
    throwNotFound('管理员不存在')
  }

  if (existingAdmin.role === 'super_admin') {
    return errorResponse('不能修改超级管理员')
  }

  const body = await readBody(event)
  const updateData: Record<string, unknown> = {}

  if (body.role && ['admin'].includes(body.role)) {
    updateData.role = body.role
  }

  if (body.permissions !== undefined) {
    updateData.permissions = JSON.stringify(body.permissions)
  }

  if (body.status && ['active', 'inactive', 'suspended'].includes(body.status)) {
    updateData.status = body.status
  }

  if (Object.keys(updateData).length === 0) {
    return successResponse({ message: '无变更' })
  }

  await update('admins', updateData, 'id = ?', [id])

  await logAdminAction(
    admin.adminId,
    'update_admin',
    { adminId: id, changes: updateData },
    'admin',
    id
  )

  return successResponse({ message: '更新成功' })
})
