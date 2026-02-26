<template>
  <div class="min-h-[calc(100vh-4rem)] py-8">
    <div class="container-zen max-w-3xl">
      <NuxtLink to="/orders" class="inline-flex items-center gap-1 text-stone hover:text-charcoal mb-6">
        <Icon name="heroicons:chevron-left" class="w-4 h-4" />
        返回订单列表
      </NuxtLink>

      <div v-if="order">
        <!-- 订单状态 -->
        <div class="bg-white rounded-sm border border-sakura p-6 mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-medium text-charcoal mb-2">
                {{ getStatusLabel(order.status) }}
              </h1>
              <p class="text-sm text-stone">订单号：{{ order.order_no }}</p>
            </div>
            <div v-if="order.status === 'pending'" class="text-right">
              <p class="text-sm text-stone mb-2">待支付金额</p>
              <p class="text-2xl font-medium text-indigo">¥{{ order.total_amount }}</p>
            </div>
          </div>

          <!-- 支付按钮 -->
          <div v-if="order.status === 'pending'" class="mt-4 pt-4 border-t border-sakura flex gap-4">
            <button @click="cancelOrder" class="btn-outline flex-1">取消订单</button>
            <button @click="payOrder" class="btn-primary flex-1">立即支付</button>
          </div>
        </div>

        <!-- 商品信息 -->
        <div class="bg-white rounded-sm border border-sakura p-6 mb-6">
          <h2 class="text-lg font-medium text-charcoal mb-4">商品信息</h2>
          <div class="space-y-4">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="flex items-center justify-between pb-4 border-b border-sakura/50 last:border-0 last:pb-0"
            >
              <div>
                <p class="font-medium text-charcoal">{{ item.service_name }}</p>
                <p class="text-sm text-stone">{{ formatNumber(item.tokens) }} tokens × {{ item.quantity }}</p>
              </div>
              <p class="text-charcoal">¥{{ item.subtotal }}</p>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-sakura flex justify-between">
            <span class="text-stone">合计</span>
            <div class="text-right">
              <p class="text-lg font-medium text-indigo">¥{{ order.total_amount }}</p>
              <p class="text-sm text-stone">{{ formatNumber(order.total_tokens) }} tokens</p>
            </div>
          </div>
        </div>

        <!-- 订单信息 -->
        <div class="bg-white rounded-sm border border-sakura p-6">
          <h2 class="text-lg font-medium text-charcoal mb-4">订单信息</h2>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-stone">订单号</span>
              <span class="text-charcoal">{{ order.order_no }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-stone">创建时间</span>
              <span class="text-charcoal">{{ formatDateTime(order.created_at) }}</span>
            </div>
            <div v-if="order.paid_at" class="flex justify-between">
              <span class="text-stone">支付时间</span>
              <span class="text-charcoal">{{ formatDateTime(order.paid_at) }}</span>
            </div>
            <div v-if="order.payment_method" class="flex justify-between">
              <span class="text-stone">支付方式</span>
              <span class="text-charcoal">{{ getPaymentMethodLabel(order.payment_method) }}</span>
            </div>
            <div v-if="order.cancelled_at" class="flex justify-between">
              <span class="text-stone">取消时间</span>
              <span class="text-charcoal">{{ formatDateTime(order.cancelled_at) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-16">
        <Icon name="heroicons:document-text" class="w-16 h-16 text-sand mx-auto mb-4" />
        <p class="text-stone">订单不存在</p>
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
  title: '订单详情 - TomyBot'
})

interface OrderItem {
  id: number
  service_name: string
  tokens: number
  quantity: number
  subtotal: number
}

interface Order {
  id: number
  order_no: string
  total_amount: number
  total_tokens: number
  status: 'pending' | 'paid' | 'cancelled' | 'refunded'
  payment_method: string | null
  paid_at: string | null
  cancelled_at: string | null
  created_at: string
  items: OrderItem[]
}

const auth = useAuth()
const router = useRouter()
const route = useRoute()

const order = ref<Order | null>(null)

onMounted(async () => {
  await auth.fetchUser()
  if (!auth.state.value.user) {
    router.push('/login')
    return
  }
  await loadOrder()
})

const loadOrder = async () => {
  const id = route.params.id
  if (!id) return

  try {
    const response = await $fetch(`/api/orders/${id}`, {
      headers: auth.getAuthHeaders()
    })
    if (response.success) {
      order.value = response.data
    }
  } catch (error) {
    console.error('Failed to load order:', error)
  }
}

const cancelOrder = async () => {
  if (!order.value || !confirm('确定要取消这个订单吗？')) return

  try {
    await $fetch(`/api/orders/${order.value.id}/cancel`, {
      method: 'POST',
      headers: auth.getAuthHeaders()
    })
    await loadOrder()
  } catch (error: any) {
    alert(error.data?.message || '取消失败')
  }
}

const payOrder = () => {
  if (!order.value) return
  router.push(`/checkout?orderId=${order.value.id}`)
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    cancelled: '已取消',
    refunded: '已退款'
  }
  return labels[status] || status
}

const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    alipay: '支付宝',
    wechat: '微信支付',
    balance: '余额支付'
  }
  return labels[method] || method
}

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

const formatNumber = (num: number) => {
  return num.toLocaleString()
}
</script>
