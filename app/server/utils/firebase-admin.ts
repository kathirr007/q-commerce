import { initializeApp as initAdminApp, getApps, cert } from 'firebase-admin/app'
import { getMessaging } from 'firebase-admin/messaging'

let _initialized = false

function ensureAdmin() {
  if (_initialized) return true
  const projectId = process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('[FCM] Missing Firebase Admin credentials')
    return false
  }

  if (getApps().length === 0) {
    initAdminApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n')
      })
    })
  }
  _initialized = true
  return true
}

export async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  if (!ensureAdmin()) return

  try {
    await getMessaging().send({
      token,
      notification: { title, body },
      data
    })
  } catch (err) {
    console.warn('[FCM] Send failed:', err)
  }
}
