import { useDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { driver } = useDb()
  if (driver !== 'postgres') {
    return { ok: true, skipped: true }
  }

  const body = await readBody(event)
  const { user_id, fcm_token } = body

  if (!user_id || !fcm_token) {
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }

  return { ok: true }
})
