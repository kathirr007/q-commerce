import { useDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { driver } = useDb()
  if (driver !== 'postgres') {
    throw createError({ statusCode: 400, message: 'Razorpay requires postgres driver' })
  }

  const body = await readBody(event)
  const razorpayKeySecret = process.env.NUXT_RAZORPAY_KEY_SECRET
  if (!razorpayKeySecret) {
    throw createError({ statusCode: 500, message: 'Razorpay key secret not configured' })
  }

  const Razorpay = await import('razorpay').then(m => m.default || m)
  const instance = new Razorpay({
    key_id: process.env.NUXT_PUBLIC_RAZORPAY_KEY_ID || '',
    key_secret: razorpayKeySecret
  })

  const order = await instance.orders.create({
    amount: Math.round(body.amount * 100),
    currency: 'INR',
    receipt: body.order_id
  })

  return order
})
