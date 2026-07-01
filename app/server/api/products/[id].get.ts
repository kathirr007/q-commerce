import { eq } from 'drizzle-orm'
import { useDb, useSchema } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { db } = useDb()
  const schema = useSchema()

  const product = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.id, id))
    .get()

  if (!product) {
    throw createError({ statusCode: 404, message: 'Product not found' })
  }

  return product
})
