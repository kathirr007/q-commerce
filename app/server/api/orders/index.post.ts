import { eq } from 'drizzle-orm'
import { useDb, useSchema } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { db } = useDb()
  const schema = useSchema()

  const { store_id, delivery_address, items, payment_method } = body

  if (!store_id || !delivery_address || !items?.length) {
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }

  const total = items.reduce((sum: number, item: any) => sum + item.unit_price * item.quantity, 0)
  const deliveryFee = 20

  const user = event.context.user

  const order = await db
    .insert(schema.orders)
    .values({
      userId: user?.id || '00000000-0000-0000-0000-000000000000',
      storeId: store_id,
      total: total + deliveryFee,
      deliveryAddress: delivery_address,
      deliveryFee,
      status: 'pending',
      paymentStatus: 'pending'
    })
    .returning()
    .get()

  for (const item of items) {
    await db.insert(schema.orderItems).values({
      orderId: order.id,
      productId: item.product_id,
      quantity: item.quantity,
      unitPrice: item.unit_price
    })
  }

  await db.insert(schema.payments).values({
    orderId: order.id,
    method: payment_method || 'cod',
    status: 'pending',
    amount: total + deliveryFee
  })

  return order
})
