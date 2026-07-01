import { createHmac } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { order_id, payment_id, razorpay_signature } = body

  const secret = process.env.NUXT_RAZORPAY_KEY_SECRET
  if (!secret) {
    throw createError({ statusCode: 500, message: 'Razorpay secret not configured' })
  }

  const expected = createHmac('sha256', secret)
    .update(`${order_id}|${payment_id}`)
    .digest('hex')

  if (expected !== razorpay_signature) {
    throw createError({ statusCode: 400, message: 'Invalid signature' })
  }

  return { verified: true }
})
