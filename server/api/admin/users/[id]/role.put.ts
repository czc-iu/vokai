import { requireAdmin, logAdminAction } from '../../../../utils/adminAuth'
import { getUserAdmin, updateUserRole } from '../../../../utils/adminUsers'
import { successResponse, errorResponse, throwNotFound } from '../../../../utils/response'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  const id = parseInt(getRouterParam(event, 'id') || '0')
  if (!id) {
    throwNotFound('用户不存在')
  }

  const existing = await getUserAdmin(id)
  if (!existing) {
    throwNotFound('用户不存在')
  }

  const body = await readBody(event)
  const role = body.role as 'user' | 'admin'

  if (!['user', 'admin'].includes(role)) {
    return errorResponse('无效的角色')
  }

  try {
    await updateUserRole(id, role)

    await logAdminAction(
      admin.adminId,
      'update_user_role',
      { userId: id, oldRole: existing.role, newRole: role },
      'user',
      id
    )

    return successResponse({ message: '角色更新成功', role })
  } catch (error: any) {
    return errorResponse(error.message || '更新角色失败')
  }
})
