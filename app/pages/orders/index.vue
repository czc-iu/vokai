<template>
  <div class="min-h-[calc(100vh-4rem)] py-8">
    <div class="container-zen">
      <h1 class="text-2xl font-medium text-charcoal mb-8">我的订单</h1>

      <!-- 筛选 -->
      <div class="flex gap-2 mb-6">
        <button
          v-for="s in statusOptions"
          :key="s.value"
          @click="filterStatus = s.value"
          class="px-4 py-2 rounded-sm text-sm"
          :class="filterStatus === s.value ? 'bg-indigo text-white' : 'bg-sakura text-charcoal hover:bg-sand'"
        >
          {{ s.label }}
        </button>
      </div>

      <!-- 订单列表 -->
      <div v-if="orders.length === 0" class="text-center py-16">
        <Icon name="heroicons:document-text" class="w-16 h-16 text-sand mx-auto mb-4" />
        <p class="text-stone mb-4">暂无订单</p>
        <NuxtLink to="/services" class="btn-primary">
          去购买
        </NuxtLink>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="order in orders"
          :key="order.id"
          class="bg-white rounded-sm border border-sakura overflow-hidden"
        >
          <!-- 订单头部 -->
          <div class="px-4 py-3 bg-sakura/30 flex items-center justify-between">
            <div class="flex items-center gap-4 text-sm">
              <span class="text-stone">订单号：{{ order.order_no }}</span>
              <span class="text-stone">{{ formatDateTime(order.created_at) }}</span>
            </div>
            <span
              class="text-sm font-medium"
              :class="getStatusClass(order.status)"
            >
              {{ getStatusLabel(order.status) }}
            </span>
          </div>

          <!-- 订单商品 -->
          <div class="p-4 divide-y divide-sakura/50">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="flex items-center justify-between py-2 first:pt-0 last:pb-0"
            >
              <div>
                <p class="text-charcoal">{{ item.service_name }}</p>
                <p class="text-sm text-stone">{{ formatNumber(item.tokens) }} tokens × {{ item.quantity }}</p>
              </div>
              <p class="text-charcoal">¥{{ item.subtotal }}</p>
            </div>
          </div>

          <!-- 订单底部 -->
          <div class="px-4 py-3 border-t border-sakura/50 flex items-center justify-between">
            <div class="text-sm">
              <span class="text-stone">共 {{ order.items.length }} 件商品，合计：</span>
              <span class="text-lg font-medium text-indigo">¥{{ order.total_amount }}</span>
            </div>
            <div class="flex gap-2">
              <button
                v-if="order.status === 'pending'"
                @click="cancelOrder(order.id)"
                class="btn-outline text-sm py-1 px-3"
              >
                取消订单
              </button>
              <button
                v-if="order.status === 'pending'"
                @click="payOrder(order)"
                class="btn-primary text-sm py-1 px-3"
              >
                去支付
              </button>
              <NuxtLink
                :to="`/orders/${order.id}`"
                class="btn-soft text-sm py-1 px-3"
              >
                查看详情
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="pagination.totalPages > 1" class="flex justify-center gap-2 mt-8">
        <button
          v-for="page in pagination.totalPages"
          :key="page"
          @click="loadOrders(page)"
          class="w-8 h-8 rounded-sm text-sm"
          :class="page === pagination.page ? 'bg-indigo text-white' : 'bg-sakura text-charcoal hover:bg-sand'"
        >
          {{ page }}
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
  title: '我的订单 - TomyBot'
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
  created_at: string
  items: OrderItem[]
}

const auth = useAuth()
const router = useRouter()

const orders = ref<Order[]>([])
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

const filterStatus = ref('')
const statusOptions = [
  { value: '', label: '全部' },
  { value: 'pending', label: '待支付' },
  { value: 'paid', label: '已支付' },
  { value: 'cancelled', label: '已取消' },
  { value: 'refunded', label: '已退款' }
]

watch(filterStatus, () => {
  loadOrders(1)
})

onMounted(async () => {
  await auth.fetchUser()
  if (!auth.state.value.user) {
    router.push('/login')
    return
  }
  await loadOrders()
})

const loadOrders = async (page = 1) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '10'
    })
    if (filterStatus.value) {
      params.append('status', filterStatus.value)
    }

    const response = await $fetch(`/api/orders?${params}`, {
      headers: auth.getAuthHeaders()
    })
    if (response.success) {
      orders.value = response.data.orders
      pagination.value = response.data.pagination
    }
  } catch (error) {
    console.error('Failed to load orders:', error)
  }
}

const cancelOrder = async (orderId: number) => {
  if (!confirm('确定要取消这个订单吗？')) return

  try {
    await $fetch(`/api/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: auth.getAuthHeaders()
    })
    await loadOrders(pagination.value.page)
  } catch (error: any) {
    alert(error.data?.message || '取消失败')
  }
}

const payOrder = (order: Order) => {
  router.push(`/checkout?orderId=${order.id}`)
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

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'text-yellow-600',
    paid: 'text-matcha',
    cancelled: 'text-stone',
    refunded: 'text-indigo'
  }
  return classes[status] || ''
}

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

const formatNumber = (num: number) => {
  return num.toLocaleString()
}
</script>
