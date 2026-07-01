import { eq } from 'drizzle-orm'
import { useDb, useSchema } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const body = await readBody(event)
  const { db } = useDb()
  const schema = useSchema()

  const partner = await db.update(schema.deliveryPartners).set(body).where(eq(schema.deliveryPartners.id, id)).returning().get()
  if (!partner) throw createError({ statusCode: 404, message: 'Delivery partner not found' })
  return partner
})
