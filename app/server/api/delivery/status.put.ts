import { eq } from 'drizzle-orm'
import { useDb, useSchema } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { db } = useDb()
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

  return delivery
})
