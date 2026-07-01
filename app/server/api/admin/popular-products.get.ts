import { count, desc, eq } from 'drizzle-orm'
import { useDb, useSchema } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const { db } = useDb()
  const schema = useSchema()

  const results = await db
    .select({
      productId: schema.orderItems.productId,
      totalSold: count()
    })
    .from(schema.orderItems)
    .groupBy(schema.orderItems.productId)
    .orderBy(desc(count()))
    .limit(10)
    .all()

  const withNames = await Promise.all(
    results.map(async (r: any) => {
      const product = await db.select().from(schema.products).where(eq(schema.products.id, r.productId)).get()
      return { ...r, productName: product?.name || 'Unknown', price: product?.price || 0 }
    })
  )

  return withNames
})
