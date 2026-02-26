import { deleteCommand } from '../../../utils/executor'
import { successResponse, throwNotFound } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throwNotFound('命令不存在')
  }

  const deleted = await deleteCommand(parseInt(id))

  if (!deleted) {
    throwNotFound('命令不存在')
  }

  return successResponse({ deleted: true })
})
