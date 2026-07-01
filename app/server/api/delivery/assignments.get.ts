import { eq } from 'drizzle-orm'
import { useDb, useSchema } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { db } = useDb()
  const schema = useSchema()
  const user = event.context.user

  const deliveries = await db
    .select()
    .from(schema.deliveries)
    .where(eq(schema.deliveries.deliveryPartnerId, user?.id || ''))
    .all()

  const withOrders = await Promise.all(
    deliveries.map(async (d: any) => {
      const order = await db.select().from(schema.orders).where(eq(schema.orders.id, d.orderId)).get()
      return { ...d, order }
    })
  )

  return withOrders
})
