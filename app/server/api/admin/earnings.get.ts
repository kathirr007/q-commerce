import { eq, count } from 'drizzle-orm'
import { useDb, useSchema } from '~/server/utils/db'

const DELIVERY_FEE = 30

export default defineEventHandler(async () => {
  const { db } = useDb()
  const schema = useSchema()

  const perPartner = await db
    .select({
      partnerId: schema.deliveries.deliveryPartnerId,
      completedDeliveries: count()
    })
    .from(schema.deliveries)
    .where(eq(schema.deliveries.status, 'delivered'))
    .groupBy(schema.deliveries.deliveryPartnerId)
    .all()

  const withNames = await Promise.all(
    perPartner.map(async (r: any) => {
      const partner = await db
        .select()
        .from(schema.deliveryPartners)
        .where(eq(schema.deliveryPartners.id, r.partnerId))
        .get()

      const user = partner
        ? await db.select().from(schema.users).where(eq(schema.users.id, (partner as any).userId)).get()
        : null

      return {
        partnerId: r.partnerId,
        partnerName: (user as any)?.name || 'Unknown',
        completedDeliveries: r.completedDeliveries,
        totalEarnings: r.completedDeliveries * DELIVERY_FEE
      }
    })
  )

  return withNames
})
