import { desc } from 'drizzle-orm'
import { useDb, useSchema } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const { db } = useDb()
  const schema = useSchema()
  return await db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt)).all()
})
