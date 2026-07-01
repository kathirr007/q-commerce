export default defineEventHandler(async (event) => {
  const method = event.method
  const url = getRequestURL(event)

  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
  setResponseHeader(event, 'X-Frame-Options', 'DENY')
  setResponseHeader(event, 'X-XSS-Protection', '1; mode=block')

  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    const origin = getRequestHeader(event, 'origin')
    const host = getRequestHeader(event, 'host')
    if (origin && host && !origin.includes(host) && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      throw createError({ statusCode: 403, message: 'Cross-origin requests not allowed' })
    }
  }
})
