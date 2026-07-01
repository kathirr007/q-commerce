import { eq, count, sql, desc } from 'drizzle-orm'
import { useDb, useSchema } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const { db } = useDb()
  const schema = useSchema()

  const [totalOrders] = await db.select({ value: count() }).from(schema.orders)
  const [totalRevenue] = await db.select({ value: sql<number>`COALESCE(SUM(total), 0)` }).from(schema.orders).where(eq(schema.orders.status, 'delivered'))
  const [activeStores] = await db.select({ value: count() }).from(schema.stores).where(eq(schema.stores.status, 'active'))
  const [totalProducts] = await db.select({ value: count() }).from(schema.products).where(eq(schema.products.status, 'active'))
  const [totalPartners] = await db.select({ value: count() }).from(schema.deliveryPartners)

  const ordersByStatus = await db
    .select({ status: schema.orders.status, count: count() })
    .from(schema.orders)
    .groupBy(schema.orders.status)

  const recentOrders = await db
    .select()
    .from(schema.orders)
    .orderBy(desc(schema.orders.createdAt))
    .limit(10)
    .all()

  return {
    totalOrders: totalOrders?.value || 0,
    totalRevenue: totalRevenue?.value || 0,
    activeStores: activeStores?.value || 0,
    totalProducts: totalProducts?.value || 0,
    totalDeliveryPartners: totalPartners?.value || 0,
    ordersByStatus: ordersByStatus || [],
    recentOrders: recentOrders || []
  }
})
