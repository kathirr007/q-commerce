import { eq, desc } from 'drizzle-orm'
import { useDb, useSchema } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const { db } = useDb()
  const schema = useSchema()
  return await db.select().from(schema.products).orderBy(desc(schema.products.createdAt)).all()
})
