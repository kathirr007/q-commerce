import { useDb, useSchema } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { db } = useDb()
  const schema = useSchema()

  const product = await db.insert(schema.products).values({
    storeId: body.store_id,
    name: body.name,
    description: body.description || null,
    price: body.price,
    images: body.images || [],
    categoryId: body.category_id || null,
    status: body.status || 'active'
  }).returning().get()

  if (body.stock_level !== undefined) {
    await db.insert(schema.inventory).values({
      productId: product.id,
      storeId: body.store_id,
      stockLevel: body.stock_level,
      reservedStock: 0
    })
  }

  return product
})
