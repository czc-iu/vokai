export default defineNuxtRouteMiddleware(async (to) => {
  // 只在客户端执行认证检查
  if (import.meta.server) {
    return
  }
  
  const auth = useAuth()
  
  // 如果 state 中没有用户，尝试从 localStorage 恢复
  if (!auth.state.value.user) {
    await auth.fetchUser()
  }
  
  // 如果仍然没有用户，跳转到登录页
  if (!auth.state.value.user) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
