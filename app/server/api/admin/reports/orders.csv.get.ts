import { desc } from 'drizzle-orm'
import { useDb, useSchema } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { db } = useDb()
  const schema = useSchema()

  const orders = await db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt)).all()

  const csv = [
    'ID,User ID,Store ID,Status,Total,Delivery Fee,Payment Status,Delivery Address,Created At',
    ...orders.map((o: any) =>
      `"${o.id}","${o.userId}","${o.storeId}","${o.status}",${o.total},${o.deliveryFee},"${o.paymentStatus}","${(o.deliveryAddress || '').replace(/"/g, '""')}","${o.createdAt}"`
    )
  ].join('\n')

  setHeader(event, 'Content-Type', 'text/csv')
  setHeader(event, 'Content-Disposition', `attachment; filename="orders-${new Date().toISOString().split('T')[0]}.csv"`)

  return csv
})
