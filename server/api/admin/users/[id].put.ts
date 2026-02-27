import { requireAdmin, logAdminAction } from '../../../utils/adminAuth'
import { getUserAdmin, updateUserAdmin } from '../../../utils/adminUsers'
import { successResponse, errorResponse, throwNotFound } from '../../../utils/response'

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

  try {
    await updateUserAdmin(id, {
      name: body.name,
      phone: body.phone,
      company: body.company,
      avatar: body.avatar
    })

    const user = await getUserAdmin(id)

    await logAdminAction(admin.adminId, 'update_user', { userId: id, changes: body }, 'user', id)

    return successResponse(user)
  } catch (error: any) {
    return errorResponse(error.message || '更新用户失败')
  }
})
