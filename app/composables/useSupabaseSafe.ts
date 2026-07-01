export function useSupabaseSafe() {
  const config = useRuntimeConfig()

  if (!config.public.supabaseUrl || !config.public.supabaseKey) {
    return { client: null, user: null, ready: false }
  }

  try {
    const client = useSupabaseClient()
    const user = useSupabaseUser()
    return { client, user, ready: true }
  } catch {
    return { client: null, user: null, ready: false }
  }
}

export async function safeGetUser() {
  const { client, ready } = useSupabaseSafe()
  if (!ready || !client) return null

  try {
    const { data } = await client.auth.getUser()
    return data?.user || null
  } catch {
    return null
  }
}
