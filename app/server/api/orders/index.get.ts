import { eq, desc } from 'drizzle-orm'
import { useDb, useSchema } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { db } = useDb()
  const schema = useSchema()
  const user = event.context.user

  const orders = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.userId, user?.id || ''))
    .orderBy(desc(schema.orders.createdAt))
    .all()

  const ordersWithItems = await Promise.all(
    orders.map(async (order: any) => {
      const items = await db
        .select()
        .from(schema.orderItems)
        .where(eq(schema.orderItems.orderId, order.id))
        .all()

      const payment = await db
        .select()
        .from(schema.payments)
        .where(eq(schema.payments.orderId, order.id))
        .get()

      return { ...order, items, payment }
    })
  )

  return ordersWithItems
})
