export default defineNuxtRouteMiddleware(async () => {
  let user: any = null

  try {
    const { data } = await useSupabaseClient().auth.getUser()
    user = data?.user || null
  } catch {
    user = null
  }

  if (user) {
    return navigateTo('/')
  }
})
