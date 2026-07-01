import { eq } from 'drizzle-orm'
import { useDb, useSchema } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { db } = useDb()
  const schema = useSchema()

  const delivery = await db
    .select()
    .from(schema.deliveries)
    .where(eq(schema.deliveries.orderId, id))
    .get()

  if (!delivery) {
    throw createError({ statusCode: 404, message: 'Delivery not found' })
  }

  return delivery
})
