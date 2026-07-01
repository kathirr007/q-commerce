import { eq, count, sql, sum } from 'drizzle-orm'
import { useDb, useSchema } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const { db } = useDb()
  const schema = useSchema()

  const [orderCount] = await db.select({ value: count() }).from(schema.orders)
  const [storeCount] = await db.select({ value: count() }).from(schema.stores).where(eq(schema.stores.status, 'active'))
  const [partnerCount] = await db.select({ value: count() }).from(schema.deliveryPartners)
  const [revenue] = await db.select({ value: sql<number>`COALESCE(SUM(total), 0)` }).from(schema.orders).where(eq(schema.orders.status, 'delivered'))

  return {
    totalOrders: orderCount?.value || 0,
    activeStores: storeCount?.value || 0,
    deliveryPartners: partnerCount?.value || 0,
    revenueToday: revenue?.value || 0
  }
})
