import { eq } from 'drizzle-orm'
import { useDb, useSchema } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const body = await readBody(event)
  const { db } = useDb()
  const schema = useSchema()

  const store = await db.update(schema.stores).set(body).where(eq(schema.stores.id, id)).returning().get()
  if (!store) throw createError({ statusCode: 404, message: 'Store not found' })
  return store
})
