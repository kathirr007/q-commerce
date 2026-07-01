import { eq } from 'drizzle-orm'
import { useDb, useSchema } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const { db } = useDb()
  const schema = useSchema()
  const stores = await db
    .select()
    .from(schema.stores)
    .where(eq(schema.stores.status, 'active'))
    .all()
  return stores
})
