import { queryOne, insert, update } from './db'

export interface UserSettings {
  userId: number
  enableRag: boolean
}

function getConfig() {
  const config = useRuntimeConfig()
  return {
    ragEnableByDefault: config.ragEnableByDefault !== false
  }
}

export async function getUserSettings(userId: number): Promise<UserSettings> {
  const config = getConfig()
  const result = await queryOne<{ user_id: number; enable_rag: boolean }>(
    'SELECT user_id, enable_rag FROM user_settings WHERE user_id = ?',
    [userId]
  )

  if (!result) {
    return {
      userId,
      enableRag: config.ragEnableByDefault
    }
  }

  return {
    userId: result.user_id,
    enableRag: result.enable_rag
  }
}

export async function updateUserSettings(
  userId: number,
  settings: Partial<Pick<UserSettings, 'enableRag'>>
): Promise<UserSettings> {
  const existing = await queryOne<{ id: number }>(
    'SELECT id FROM user_settings WHERE user_id = ?',
    [userId]
  )

  if (existing) {
    await update(
      'user_settings',
      { enable_rag: settings.enableRag },
      'user_id = ?',
      [userId]
    )
  } else {
    await insert('user_settings', {
      user_id: userId,
      enable_rag: settings.enableRag ?? getConfig().ragEnableByDefault
    })
  }

  return getUserSettings(userId)
}

export async function isRagEnabled(userId: number): Promise<boolean> {
  const settings = await getUserSettings(userId)
  return settings.enableRag
}