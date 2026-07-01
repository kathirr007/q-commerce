import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

export default defineNuxtPlugin(() => {
  const firebaseConfig = {
    apiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
    messagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID
  }

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) return

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

  if ('Notification' in window && Notification.permission === 'granted') {
    const messaging = getMessaging(app)

    getToken(messaging, {
      vapidKey: process.env.NUXT_PUBLIC_FIREBASE_VAPID_KEY
    }).then((token) => {
      if (token) {
        const user = useSupabaseUser()
        if (user.value?.id) {
          $fetch('/api/notifications/register-token', {
            method: 'POST',
            body: { user_id: user.value.id, fcm_token: token }
          })
        }
      }
    })

    onMessage(messaging, (payload) => {
      if (payload.notification) {
        new Notification(payload.notification.title || '', {
          body: payload.notification.body
        })
      }
    })
  }
})
