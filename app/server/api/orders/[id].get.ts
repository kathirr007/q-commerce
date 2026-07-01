import { eq } from 'drizzle-orm'
import { useDb, useSchema } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { db } = useDb()
  const schema = useSchema()

  const order = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.id, id))
    .get()

  if (!order) {
    throw createError({ statusCode: 404, message: 'Order not found' })
  }

  const items = await db
    .select()
    .from(schema.orderItems)
    .where(eq(schema.orderItems.orderId, id))
    .all()

  const payment = await db
    .select()
    .from(schema.payments)
    .where(eq(schema.payments.orderId, id))
    .get()

  const store = await db
    .select()
    .from(schema.stores)
    .where(eq(schema.stores.id, order.storeId))
    .get()

  const delivery = await db
    .select()
    .from(schema.deliveries)
    .where(eq(schema.deliveries.orderId, id))
    .get()

  return { ...order, items, payment, store, delivery }
})
