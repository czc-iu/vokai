export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth()
  
  // 确保在客户端执行
  if (import.meta.client) {
    // 如果 state 中没有用户，尝试从 localStorage 恢复
    if (!auth.state.value.user) {
      await auth.fetchUser()
    }
  }
  
  // 如果仍然没有用户，跳转到登录页
  if (!auth.state.value.user) {
    return navigateTo('/login', {
      query: {
        redirect: to.fullPath
      }
    } as const)
  }
})
