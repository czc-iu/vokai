<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <NuxtLink 
        to="/admin/orders"
        class="text-gray-500 hover:text-gray-700"
      >
        <Icon name="heroicons:arrow-left" class="w-5 h-5" />
      </NuxtLink>
      <div>
        <h2 class="text-lg font-medium text-charcoal">{{ $t('admin.orders.orderDetail') }}</h2>
        <p class="text-sm text-gray-500">{{ order?.order_no }}</p>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      {{ $t('common.loading') }}
    </div>

    <template v-else-if="order">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-sm font-medium text-gray-900 mb-4">{{ $t('admin.orders.orderInfo') }}</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500">{{ $t('admin.orders.table.orderNo') }}:</span>
                <span class="ml-2 text-charcoal">{{ order.order_no }}</span>
              </div>
              <div>
                <span class="text-gray-500">{{ $t('admin.orders.table.status') }}:</span>
                <span 
                  class="ml-2 px-2 py-1 text-xs font-medium rounded-full"
                  :class="{
                    'bg-yellow-100 text-yellow-800': order.status === 'pending',
                    'bg-green-100 text-green-800': order.status === 'paid',
                    'bg-gray-100 text-gray-800': order.status === 'cancelled',
                    'bg-red-100 text-red-800': order.status === 'refunded'
                  }"
                >
                  {{ getStatusText(order.status) }}
                </span>
              </div>
              <div>
                <span class="text-gray-500">{{ $t('admin.orders.table.amount') }}:</span>
                <span class="ml-2 text-charcoal font-medium">¥{{ order.total_amount }}</span>
              </div>
              <div>
                <span class="text-gray-500">{{ $t('admin.orders.table.tokens') }}:</span>
                <span class="ml-2 text-charcoal">{{ formatNumber(order.total_tokens) }}</span>
              </div>
              <div>
                <span class="text-gray-500">{{ $t('admin.orders.table.createdAt') }}:</span>
                <span class="ml-2 text-charcoal">{{ formatDateTime(order.created_at) }}</span>
              </div>
              <div v-if="order.paid_at">
                <span class="text-gray-500">{{ $t('admin.orders.paidAt') }}:</span>
                <span class="ml-2 text-charcoal">{{ formatDateTime(order.paid_at) }}</span>
              </div>
              <div v-if="order.payment_method">
                <span class="text-gray-500">{{ $t('admin.orders.paymentMethod') }}:</span>
                <span class="ml-2 text-charcoal">{{ order.payment_method }}</span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-sm font-medium text-gray-900">{{ $t('admin.orders.orderItems') }}</h3>
            </div>
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ $t('admin.orders.items.serviceName') }}</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{{ $t('admin.orders.items.tokens') }}</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{{ $t('admin.orders.items.price') }}</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{{ $t('admin.orders.items.quantity') }}</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{{ $t('admin.orders.items.subtotal') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="item in order.items" :key="item.id">
                  <td class="px-6 py-4 text-sm text-charcoal">{{ item.service_name }}</td>
                  <td class="px-6 py-4 text-sm text-gray-500 text-right">{{ formatNumber(item.tokens) }}</td>
                  <td class="px-6 py-4 text-sm text-gray-500 text-right">¥{{ item.price }}</td>
                  <td class="px-6 py-4 text-sm text-gray-500 text-right">{{ item.quantity }}</td>
                  <td class="px-6 py-4 text-sm text-charcoal text-right">¥{{ item.subtotal }}</td>
                </tr>
              </tbody>
              <tfoot class="bg-gray-50">
                <tr>
                  <td colspan="4" class="px-6 py-4 text-sm font-medium text-charcoal text-right">{{ $t('admin.orders.total') }}</td>
                  <td class="px-6 py-4 text-sm font-bold text-charcoal text-right">¥{{ order.total_amount }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-sm font-medium text-gray-900 mb-4">{{ $t('admin.orders.userInfo') }}</h3>
            <div class="space-y-3 text-sm">
              <div>
                <span class="text-gray-500">{{ $t('admin.orders.userEmail') }}:</span>
                <NuxtLink 
                  :to="`/admin/users/${order.user_id}`"
                  class="ml-2 text-indigo hover:text-indigo-dark"
                >
                  {{ order.user_email }}
                </NuxtLink>
              </div>
              <div v-if="order.user_name">
                <span class="text-gray-500">{{ $t('admin.orders.userName') }}:</span>
                <span class="ml-2 text-charcoal">{{ order.user_name }}</span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-sm font-medium text-gray-900 mb-4">{{ $t('admin.orders.actions') }}</h3>
            <div class="space-y-3">
              <button 
                v-if="order.status === 'pending'"
                @click="updateStatus('paid')"
                class="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                {{ $t('admin.orders.confirmPayment') }}
              </button>
              <button 
                v-if="order.status === 'pending'"
                @click="updateStatus('cancelled')"
                class="w-full px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700"
              >
                {{ $t('admin.orders.cancelOrder') }}
              </button>
              <button 
                v-if="order.status === 'paid'"
                @click="updateStatus('refunded')"
                class="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                {{ $t('admin.orders.refundOrder') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { t } = useI18n()
const auth = useAuth()
const route = useRoute()

const orderId = computed(() => parseInt(route.params.id as string))

useHead({
  title: () => t('admin.orders.orderDetail')
})

interface OrderItem {
  id: number
  service_id: number
  service_name: string
  tokens: number
  price: number
  quantity: number
  subtotal: number
}

interface Order {
  id: number
  order_no: string
  user_id: number
  user_email: string
  user_name: string | null
  total_amount: number
  total_tokens: number
  status: string
  payment_method: string | null
  paid_at: string | null
  created_at: string
  items: OrderItem[]
}

const loading = ref(true)
const order = ref<Order | null>(null)

const formatNumber = (num: number) => {
  return num?.toLocaleString() || '0'
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString()
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return t('admin.orders.statusPending')
    case 'paid': return t('admin.orders.statusPaid')
    case 'cancelled': return t('admin.orders.statusCancelled')
    case 'refunded': return t('admin.orders.statusRefunded')
    default: return status
  }
}

const loadOrder = async () => {
  loading.value = true
  try {
    const res = await $fetch(`/api/admin/orders/${orderId.value}`, {
      headers: auth.getAuthHeaders()
    })
    if (res.success) {
      order.value = res.data
    }
  } catch (error) {
    console.error('Failed to load order:', error)
  } finally {
    loading.value = false
  }
}

const updateStatus = async (status: string) => {
  const messages: Record<string, string> = {
    paid: t('admin.orders.confirmPaymentMessage'),
    cancelled: t('admin.orders.cancelOrderMessage'),
    refunded: t('admin.orders.refundOrderMessage')
  }
  
  if (!confirm(messages[status])) return
  
  try {
    await $fetch(`/api/admin/orders/${orderId.value}/status`, {
      method: 'PUT',
      headers: auth.getAuthHeaders(),
      body: { 
        status,
        payment_method: status === 'paid' ? 'admin_confirm' : undefined
      }
    })
    await loadOrder()
  } catch (error) {
    console.error('Failed to update status:', error)
  }
}

onMounted(() => {
  loadOrder()
})
</script>
