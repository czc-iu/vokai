import { queryOne, insert } from '~/server/utils/db'
import { successResponse } from '~/server/utils/response'
import { requireAuth } from '~/server/utils/auth'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  
  const config = await queryOne<any>(
    'SELECT * FROM embed_configs WHERE user_id = ?',
    [user.userId]
  )
  
  if (!config) {
    const apiKey = `tb_${crypto.randomBytes(32).toString('hex')}`
    const result = await insert('embed_configs', {
      user_id: user.userId,
      api_key: apiKey,
      is_active: true,
      knowledge_base_enabled: true
    })
    
    return successResponse({
      id: result.insertId,
      apiKey,
      isActive: true,
      knowledgeBaseEnabled: true,
      customPrompt: null
    })
  }
  
  return successResponse({
    id: config.id,
    apiKey: config.api_key,
    isActive: config.is_active,
    knowledgeBaseEnabled: config.knowledge_base_enabled,
    customPrompt: config.custom_prompt
  })
})
