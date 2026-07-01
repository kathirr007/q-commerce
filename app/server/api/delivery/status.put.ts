import { eq } from 'drizzle-orm'
import { useDb, useSchema } from '~/server/utils/db'
import { sendSMS } from '~/server/utils/sms'
import { sendPushNotification } from '~/server/utils/firebase-admin'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { db, driver } = useDb()
  const schema = useSchema()

  const { delivery_id, status } = body
  if (!delivery_id || !status) {
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }

  const updateData: any = { status }

  if (status === 'picked_up') updateData.pickupTime = new Date().toISOString()
  if (status === 'delivered') updateData.deliveredTime = new Date().toISOString()

  const delivery = await db.update(schema.deliveries).set(updateData).where(eq(schema.deliveries.id, delivery_id)).returning().get()

  if (status === 'delivered') {
    await db.update(schema.orders).set({ status: 'delivered' }).where(eq(schema.orders.id, delivery.orderId))
  }

  const order = await db.select().from(schema.orders).where(eq(schema.orders.id, delivery.orderId)).get()
  const partner = await db.select().from(schema.deliveryPartners).where(eq(schema.deliveryPartners.id, delivery.deliveryPartnerId)).get()

  if (driver === 'postgres' && order?.userId) {
    const supabase = await import('../../utils/supabase').then(m => m.getSupabaseServiceRole(event))

    const { data: user } = await supabase
      .from('users')
      .select('id, phone')
      .eq('id', order.userId)
      .single()

    if (user) {
      await sendPushNotification(
        user.id,
        'Delivery Update',
        `Your order #${delivery.orderId?.slice(0, 8)} is ${status.replace(/_/g, ' ')}`
      )

      if (user.phone) {
        await sendSMS(user.phone, `QCommerce: Your order #${delivery.orderId?.slice(0, 8)} is ${status.replace(/_/g, ' ')}.`)
      }
    }
  }

  return delivery
})
