export default defineNuxtRouteMiddleware(async (to) => {
  // 只在客户端执行认证检查
  if (import.meta.server) {
    return
  }
  
  const auth = useAuth()
  
  if (!auth.state.value.user) {
    await auth.fetchUser()
  }
  
  if (!auth.state.value.user) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
  
  try {
    const response = await $fetch('/api/admin/check', {
      headers: auth.getAuthHeaders()
    }) as { success: boolean; data?: { isAdmin: boolean } }
    
    if (!response.success || !response.data?.isAdmin) {
      return navigateTo('/?error=not_admin')
    }
  } catch (error) {
    console.error('Admin check failed:', error)
    return navigateTo('/?error=not_admin')
  }
})
