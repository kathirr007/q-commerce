import { eq } from 'drizzle-orm'
import { useDb, useSchema } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const body = await readBody(event)
  const { db } = useDb()
  const schema = useSchema()

  const order = await db.update(schema.orders).set({
    status: body.status,
    paymentStatus: body.payment_status
  }).where(eq(schema.orders.id, id)).returning().get()

  if (!order) throw createError({ statusCode: 404, message: 'Order not found' })
  return order
})
