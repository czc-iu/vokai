<template>
  <div class="min-h-[calc(100vh-4rem)] py-8">
    <div class="container-zen max-w-2xl">
      <h1 class="text-2xl font-medium text-charcoal mb-8">订单结算</h1>

      <!-- 订单信息 -->
      <div class="bg-white rounded-sm border border-sakura p-6 mb-6">
        <h2 class="text-lg font-medium text-charcoal mb-4">订单详情</h2>
        <div class="space-y-3">
          <div v-for="item in orderItems" :key="item.serviceId" class="flex justify-between text-sm">
            <span class="text-charcoal">{{ item.serviceName }} × {{ item.quantity }}</span>
            <span class="text-charcoal">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
          <div class="border-t border-sakura pt-3 mt-3">
            <div class="flex justify-between">
              <span class="text-stone">Token 总数</span>
              <span class="text-charcoal">{{ formatNumber(totalTokens) }}</span>
            </div>
          </div>
          <div class="flex justify-between text-lg font-medium">
            <span class="text-charcoal">应付金额</span>
            <span class="text-indigo">¥{{ totalAmount.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- 支付方式 -->
      <div class="bg-white rounded-sm border border-sakura p-6 mb-6">
        <h2 class="text-lg font-medium text-charcoal mb-4">支付方式</h2>
        <div class="space-y-3">
          <label
            class="flex items-center gap-3 p-4 border rounded-sm cursor-pointer"
            :class="paymentMethod === 'balance' ? 'border-indigo bg-indigo/5' : 'border-sakura'"
          >
            <input
              v-model="paymentMethod"
              type="radio"
              value="balance"
              class="w-4 h-4 text-indigo"
            />
            <div class="flex-1">
              <p class="font-medium text-charcoal">余额支付</p>
              <p class="text-sm text-stone">当前余额：{{ formatNumber(userBalance) }} tokens</p>
            </div>
            <span v-if="userBalance < totalTokens" class="text-xs text-red-500">余额不足</span>
          </label>
          <label
            class="flex items-center gap-3 p-4 border rounded-sm cursor-pointer"
            :class="paymentMethod === 'alipay' ? 'border-indigo bg-indigo/5' : 'border-sakura'"
          >
            <input
              v-model="paymentMethod"
              type="radio"
              value="alipay"
              class="w-4 h-4 text-indigo"
            />
            <div class="flex-1">
              <p class="font-medium text-charcoal">支付宝</p>
              <p class="text-sm text-stone">支持花呗、信用卡支付</p>
            </div>
          </label>
          <label
            class="flex items-center gap-3 p-4 border rounded-sm cursor-pointer"
            :class="paymentMethod === 'wechat' ? 'border-indigo bg-indigo/5' : 'border-sakura'"
          >
            <input
              v-model="paymentMethod"
              type="radio"
              value="wechat"
              class="w-4 h-4 text-indigo"
            />
            <div class="flex-1">
              <p class="font-medium text-charcoal">微信支付</p>
              <p class="text-sm text-stone">支持微信扫码支付</p>
            </div>
          </label>
        </div>
      </div>

      <!-- 提交 -->
      <div class="flex gap-4">
        <NuxtLink to="/services" class="btn-outline flex-1 text-center">
          返回
        </NuxtLink>
        <button
          @click="submitOrder"
          :disabled="submitting || !canSubmit"
          class="btn-primary flex-1"
        >
          {{ submitting ? '处理中...' : `确认支付 ¥${totalAmount.toFixed(2)}` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

useHead({
  title: '订单结算 - TomyBot'
})

interface OrderItem {
  serviceId: number
  serviceName: string
  tokens: number
  price: number
  quantity: number
}

const auth = useAuth()
const router = useRouter()
const route = useRoute()

const orderItems = ref<OrderItem[]>([])
const totalAmount = ref(0)
const totalTokens = ref(0)
const userBalance = ref(0)
const paymentMethod = ref('balance')
const submitting = ref(false)

const canSubmit = computed(() => {
  if (paymentMethod.value === 'balance') {
    return userBalance.value >= totalTokens.value
  }
  return true
})

onMounted(async () => {
  await auth.fetchUser()
  if (!auth.state.value.user) {
    router.push('/login')
    return
  }

  await loadBalance()
  await loadOrderItems()
})

const loadBalance = async () => {
  try {
    const response = await $fetch('/api/billing/balance', {
      headers: auth.getAuthHeaders()
    })
    if (response.success) {
      userBalance.value = response.data.balance
    }
  } catch (error) {
    console.error('Failed to load balance:', error)
  }
}

const loadOrderItems = async () => {
  const serviceId = route.query.serviceId as string
  const isCart = route.query.cart === '1'

  if (isCart) {
    try {
      const response = await $fetch('/api/cart', {
        headers: auth.getAuthHeaders()
      })
      if (response.success) {
        orderItems.value = response.data.items.map((item: any) => ({
          serviceId: item.service_id,
          serviceName: item.service?.name || '',
          tokens: item.service?.tokens || 0,
          price: item.service?.price || 0,
          quantity: item.quantity
        }))
        totalAmount.value = response.data.totalAmount
        totalTokens.value = response.data.totalTokens
      }
    } catch (error) {
      console.error('Failed to load cart:', error)
    }
  } else if (serviceId) {
    try {
      const response = await $fetch(`/api/services/${serviceId}`)
      if (response.success) {
        orderItems.value = [{
          serviceId: response.data.id,
          serviceName: response.data.name,
          tokens: response.data.tokens,
          price: Number(response.data.price),
          quantity: 1
        }]
        totalAmount.value = Number(response.data.price)
        totalTokens.value = response.data.tokens
      }
    } catch (error) {
      console.error('Failed to load service:', error)
    }
  }
}

const submitOrder = async () => {
  if (!canSubmit.value) return

  submitting.value = true

  try {
    const response = await $fetch('/api/orders/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
      body: {
        method: paymentMethod.value,
        items: orderItems.value.map((item) => ({
          serviceId: item.serviceId,
          quantity: item.quantity
        }))
      }
    })

    if (response.success) {
      if (response.data.success) {
        alert('支付成功！')
        router.push('/billing')
      } else {
        // 需要第三方支付
        alert('请完成支付')
        router.push('/orders')
      }
    }
  } catch (error: any) {
    alert(error.data?.message || '支付失败')
  } finally {
    submitting.value = false
  }
}

const formatNumber = (num: number) => {
  return num.toLocaleString()
}
</script>
