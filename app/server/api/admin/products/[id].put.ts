import { eq } from 'drizzle-orm'
import { useDb, useSchema } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const body = await readBody(event)
  const { db } = useDb()
  const schema = useSchema()

  const product = await db.update(schema.products).set(body).where(eq(schema.products.id, id)).returning().get()
  if (!product) throw createError({ statusCode: 404, message: 'Product not found' })
  return product
})
