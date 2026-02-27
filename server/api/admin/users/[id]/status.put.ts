import { requireAdmin, logAdminAction } from '../../../../utils/adminAuth'
import { getUserAdmin, updateUserStatus } from '../../../../utils/adminUsers'
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
  const status = body.status as 'active' | 'inactive' | 'suspended'

  if (!['active', 'inactive', 'suspended'].includes(status)) {
    return errorResponse('无效的状态')
  }

  try {
    await updateUserStatus(id, status)

    await logAdminAction(
      admin.adminId,
      'update_user_status',
      { userId: id, oldStatus: existing.status, newStatus: status },
      'user',
      id
    )

    return successResponse({ message: '状态更新成功', status })
  } catch (error: any) {
    return errorResponse(error.message || '更新状态失败')
  }
})
