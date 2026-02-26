export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth()
  
  if (import.meta.client) {
    await auth.fetchUser()
  }
  
  if (!auth.state.value.user) {
    return navigateTo('/login', {
      query: {
        redirect: to.fullPath
      }
    } as const)
  }
})
