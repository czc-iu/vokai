<template>
  <div class="min-h-screen bg-cream p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">认证和余额测试</h1>
      
      <div class="bg-white rounded-lg p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">1. 认证状态</h2>
        <div class="space-y-2">
          <p><strong>用户:</strong> {{ auth.state.value.user?.email || '未登录' }}</p>
          <p><strong>Token (from state):</strong> {{ auth.state.value.token ? '存在' : '不存在' }}</p>
          <p><strong>Token (from localStorage):</strong> {{ localStorageToken }}</p>
        </div>
      </div>

      <div class="bg-white rounded-lg p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">2. 余额信息 (直接API调用)</h2>
        <div class="space-y-2">
          <p><strong>当前余额:</strong> {{ directBalance.balance }}</p>
          <p><strong>累计购买:</strong> {{ directBalance.totalPurchased }}</p>
          <p><strong>累计消耗:</strong> {{ directBalance.totalConsumed }}</p>
        </div>
      </div>

      <div class="bg-white rounded-lg p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">3. Auth Headers 检查</h2>
        <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto">{{ JSON.stringify(authHeaders, null, 2) }}</pre>
      </div>

      <div class="bg-white rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-4">4. 操作</h2>
        <div class="space-x-4">
          <button @click="testAuth" class="btn-primary">测试认证</button>
          <button @click="testBalance" class="btn-primary">测试余额</button>
          <button @click="refreshPage" class="btn-outline">刷新页面</button>
        </div>
      </div>

      <div v-if="error" class="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-800">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const auth = useAuth()
const router = useRouter()

const localStorageToken = ref('')
const directBalance = ref({
  balance: 0,
  totalPurchased: 0,
  totalConsumed: 0
})
const authHeaders = ref({})
const error = ref('')

onMounted(async () => {
  // 检查 localStorage token
  if (import.meta.client) {
    localStorageToken.value = localStorage.getItem('auth_token') || '不存在'
  }
  
  // 获取 auth headers
  authHeaders.value = auth.getAuthHeaders()
  
  // 如果没有用户，跳转到登录页
  if (!auth.state.value.user) {
    await auth.fetchUser()
    if (!auth.state.value.user) {
      router.push('/login')
      return
    }
  }
  
  // 直接调用 API 获取余额
  await testBalance()
})

const testAuth = async () => {
  try {
    error.value = ''
    const response = await $fetch('/api/auth/me', {
      headers: auth.getAuthHeaders()
    })
    console.log('Auth test response:', response)
    alert('认证成功！用户: ' + (response as any).data.email)
  } catch (err) {
    error.value = '认证失败: ' + (err as Error).message
    console.error('Auth test error:', err)
  }
}

const testBalance = async () => {
  try {
    error.value = ''
    const response = await $fetch('/api/billing/balance', {
      headers: auth.getAuthHeaders()
    }) as any
    
    if (response.success) {
      directBalance.value = {
        balance: response.data.balance,
        totalPurchased: response.data.totalPurchased,
        totalConsumed: response.data.totalConsumed
      }
      console.log('Balance:', directBalance.value)
    }
  } catch (err) {
    error.value = '获取余额失败: ' + (err as Error).message
    console.error('Balance test error:', err)
  }
}

const refreshPage = () => {
  location.reload()
}
</script>
