export default defineNuxtRouteMiddleware(async () => {
  const { data: { user } } = await useSupabaseClient().auth.getUser()

  if (user) {
    return navigateTo('/')
  }
})
