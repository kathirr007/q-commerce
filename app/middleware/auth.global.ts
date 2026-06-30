export default defineNuxtRouteMiddleware(async (to) => {
  const { data: { user } } = await useSupabaseClient().auth.getUser()

  const publicRoutes = ['/login', '/register', '/confirm', '/', '/stores', '/products']

  if (!user && !publicRoutes.some(r => to.path.startsWith(r))) {
    return navigateTo('/login')
  }

  const role = user?.user_metadata?.role

  if (to.path.startsWith('/admin') && role !== 'admin' && role !== 'store_manager') {
    return navigateTo('/')
  }

  if (to.path.startsWith('/delivery') && role !== 'delivery') {
    return navigateTo('/')
  }
})
