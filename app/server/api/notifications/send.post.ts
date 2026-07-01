import { eq } from 'drizzle-orm'
import { useDb, useSchema } from '~/server/utils/db'
import { sendPushNotification } from '~/server/utils/firebase-admin'
import { sendSMS } from '~/server/utils/sms'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { user_id, title, message, order_id } = body

  if (!user_id || !title || !message) {
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }

  const { driver } = useDb()
  if (driver === 'postgres') {
    const supabase = await import('../../utils/supabase').then(m => m.getSupabaseServiceRole(event))

    const { data: user } = await supabase
      .from('users')
      .select('phone')
      .eq('id', user_id)
      .single()

    if (user?.phone) {
      await sendSMS(user.phone, message)
    }
  }

  return { ok: true }
})
