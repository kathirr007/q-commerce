import { eq, like, and } from 'drizzle-orm'
import { useDb, useSchema } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { db } = useDb()
  const schema = useSchema()

  const conditions = [eq(schema.products.status, 'active')]

  if (query.store_id) {
    conditions.push(eq(schema.products.storeId, query.store_id as string))
  }

  if (query.search) {
    conditions.push(like(schema.products.name, `%${query.search}%`))
  }

  if (query.category_id) {
    conditions.push(eq(schema.products.categoryId, query.category_id as string))
  }

  const products = await db
    .select()
    .from(schema.products)
    .where(and(...conditions))
    .all()

  return products
})
