import { eq } from 'drizzle-orm'
import { useDb, useSchema } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { db } = useDb()
  const schema = useSchema()

  const store = await db
    .select()
    .from(schema.stores)
    .where(eq(schema.stores.id, id))
    .get()

  if (!store) {
    throw createError({ statusCode: 404, message: 'Store not found' })
  }

  const products = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.storeId, id))
    .all()

  return { ...store, products }
})
