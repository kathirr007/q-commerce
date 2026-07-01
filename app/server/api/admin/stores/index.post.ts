import { useDb, useSchema } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { db } = useDb()
  const schema = useSchema()

  const store = await db.insert(schema.stores).values({
    name: body.name,
    type: body.type,
    location: body.location,
    status: body.status || 'active',
    operatingHours: body.operatingHours || null
  }).returning().get()

  return store
})
