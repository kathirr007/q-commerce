import { useDb } from '~/server/utils/db'

export async function sendSMS(phone: string, message: string) {
  const { driver } = useDb()
  if (driver !== 'postgres') return

  const apiKey = process.env.MSG91_AUTH_KEY
  if (!apiKey) return

  try {
    await $fetch('https://api.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: { authkey: apiKey },
      body: {
        sender: 'QCOMM',
        mobiles: `91${phone.replace(/[^0-9]/g, '')}`,
        message
      }
    })
  } catch {
    console.warn('[SMS] Failed to send notification')
  }
}
