import { eq } from 'drizzle-orm'
import { useDb, useSchema } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { db } = useDb()
  const schema = useSchema()

  const { order_id, method, transaction_id } = body

  if (!order_id || !method) {
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }

  const payment = await db
    .insert(schema.payments)
    .values({
      orderId: order_id,
      method,
      status: 'paid',
      transactionId: transaction_id || null,
      amount: 0
    })
    .returning()
    .get()

  await db
    .update(schema.orders)
    .set({ paymentStatus: 'paid', status: 'confirmed' })
    .where(eq(schema.orders.id, order_id))

  return payment
})
