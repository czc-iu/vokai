<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-medium text-charcoal">{{ $t('admin.orders.orderList') }}</h2>
        <p class="text-sm text-gray-500 mt-1">{{ $t('admin.orders.description') }}</p>
      </div>
    </div>

    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <div class="flex flex-wrap gap-4">
        <div class="flex-1 min-w-[200px]">
          <input 
            v-model="searchQuery"
            type="text"
            :placeholder="$t('admin.orders.searchPlaceholder')"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo focus:border-indigo"
            @keyup.enter="loadOrders"
          />
        </div>
        <select 
          v-model="statusFilter"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo focus:border-indigo"
          @change="loadOrders"
        >
          <option value="">{{ $t('admin.orders.allStatus') }}</option>
          <option value="pending">{{ $t('admin.orders.statusPending') }}</option>
          <option value="paid">{{ $t('admin.orders.statusPaid') }}</option>
          <option value="cancelled">{{ $t('admin.orders.statusCancelled') }}</option>
          <option value="refunded">{{ $t('admin.orders.statusRefunded') }}</option>
        </select>
        <input 
          v-model="startDate"
          type="date"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo focus:border-indigo"
          @change="loadOrders"
        />
        <input 
          v-model="endDate"
          type="date"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo focus:border-indigo"
          @change="loadOrders"
        />
        <button 
          @click="loadOrders"
          class="px-4 py-2 bg-indigo text-white text-sm font-medium rounded-lg hover:bg-indigo-dark"
        >
          {{ $t('admin.orders.search') }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-sm text-gray-600">{{ $t('admin.orders.totalOrders') }}</p>
        <p class="text-2xl font-bold text-charcoal">{{ stats?.totalOrders || 0 }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-sm text-gray-600">{{ $t('admin.orders.pendingOrders') }}</p>
        <p class="text-2xl font-bold text-charcoal">{{ stats?.pendingOrders || 0 }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-sm text-gray-600">{{ $t('admin.orders.totalRevenue') }}</p>
        <p class="text-2xl font-bold text-charcoal">¥{{ formatNumber(stats?.totalRevenue || 0) }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-sm text-gray-600">{{ $t('admin.orders.todayRevenue') }}</p>
        <p class="text-2xl font-bold text-charcoal">¥{{ formatNumber(stats?.todayRevenue || 0) }}</p>
      </div>
    </div>

    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.orders.table.orderNo') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.orders.table.user') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.orders.table.amount') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.orders.table.tokens') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.orders.table.status') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.orders.table.createdAt') }}</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.orders.table.actions') }}</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-charcoal">
              {{ order.order_no }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div>
                <div class="text-sm text-charcoal">{{ order.user_name || order.user_email }}</div>
                <div class="text-xs text-gray-500">{{ order.user_email }}</div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              ¥{{ order.total_amount }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatNumber(order.total_tokens) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="{
                  'bg-yellow-100 text-yellow-800': order.status === 'pending',
                  'bg-green-100 text-green-800': order.status === 'paid',
                  'bg-gray-100 text-gray-800': order.status === 'cancelled',
                  'bg-red-100 text-red-800': order.status === 'refunded'
                }"
              >
                {{ getStatusText(order.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDateTime(order.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
              <button 
                @click="viewOrder(order)"
                class="text-indigo hover:text-indigo-dark cursor-pointer"
              >
                {{ $t('admin.orders.viewDetail') }}
              </button>
              <button 
                v-if="order.status === 'pending'"
                @click="confirmPayment(order)"
                class="text-green-600 hover:text-green-900"
              >
                {{ $t('admin.orders.confirmPayment') }}
              </button>
            </td>
          </tr>
          <tr v-if="orders.length === 0">
            <td colspan="7" class="px-6 py-12 text-center text-gray-500">
              {{ $t('admin.orders.noOrders') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="pagination.totalPages > 1" class="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
      <div class="text-sm text-gray-500">
        {{ $t('admin.orders.pagination', { from: (pagination.page - 1) * pagination.limit + 1, to: Math.min(pagination.page * pagination.limit, pagination.total), total: pagination.total }) }}
      </div>
      <div class="flex gap-2">
        <button 
          @click="changePage(pagination.page - 1)"
          :disabled="pagination.page === 1"
          class="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          {{ $t('admin.orders.prevPage') }}
        </button>
        <button 
          @click="changePage(pagination.page + 1)"
          :disabled="pagination.page === pagination.totalPages"
          class="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          {{ $t('admin.orders.nextPage') }}
        </button>
      </div>
    </div>

    <div v-if="showDetailModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h3 class="text-lg font-medium text-charcoal">{{ $t('admin.orders.orderDetail') }}</h3>
          <div class="flex items-center gap-3">
            <span v-if="detailOrder" class="text-sm text-gray-500">{{ detailOrder.order_no }}</span>
            <button @click="closeDetailModal" class="text-gray-400 hover:text-gray-600">
              <Icon name="heroicons:x-mark" class="w-5 h-5" />
            </button>
          </div>
        </div>
        <div v-if="detailLoading" class="p-6 text-center">
          {{ $t('common.loading') }}
        </div>
        <div v-else-if="detailOrder" class="p-6 space-y-6">
          <div>
            <h4 class="text-sm font-medium text-gray-900 mb-3">{{ $t('admin.orders.orderInfo') }}</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500">{{ $t('admin.orders.table.orderNo') }}:</span>
                <span class="ml-2 text-charcoal">{{ detailOrder.order_no }}</span>
              </div>
              <div>
                <span class="text-gray-500">{{ $t('admin.orders.table.status') }}:</span>
                <span 
                  class="ml-2 px-2 py-1 text-xs font-medium rounded-full"
                  :class="{
                    'bg-yellow-100 text-yellow-800': detailOrder.status === 'pending',
                    'bg-green-100 text-green-800': detailOrder.status === 'paid',
                    'bg-gray-100 text-gray-800': detailOrder.status === 'cancelled',
                    'bg-red-100 text-red-800': detailOrder.status === 'refunded'
                  }"
                >
                  {{ getStatusText(detailOrder.status) }}
                </span>
              </div>
              <div>
                <span class="text-gray-500">{{ $t('admin.orders.table.amount') }}:</span>
                <span class="ml-2 text-charcoal font-medium">¥{{ detailOrder.total_amount }}</span>
              </div>
              <div>
                <span class="text-gray-500">{{ $t('admin.orders.table.tokens') }}:</span>
                <span class="ml-2 text-charcoal">{{ formatNumber(detailOrder.total_tokens) }}</span>
              </div>
              <div>
                <span class="text-gray-500">{{ $t('admin.orders.table.createdAt') }}:</span>
                <span class="ml-2 text-charcoal">{{ formatDateTime(detailOrder.created_at) }}</span>
              </div>
              <div v-if="detailOrder.paid_at">
                <span class="text-gray-500">{{ $t('admin.orders.paidAt') }}:</span>
                <span class="ml-2 text-charcoal">{{ formatDateTime(detailOrder.paid_at) }}</span>
              </div>
              <div v-if="detailOrder.payment_method">
                <span class="text-gray-500">{{ $t('admin.orders.paymentMethod') }}:</span>
                <span class="ml-2 text-charcoal">{{ detailOrder.payment_method }}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 class="text-sm font-medium text-gray-900 mb-3">{{ $t('admin.orders.userInfo') }}</h4>
            <div class="text-sm space-y-2">
              <div>
                <span class="text-gray-500">{{ $t('admin.orders.userEmail') }}:</span>
                <span class="ml-2 text-charcoal">{{ detailOrder.user_email }}</span>
              </div>
              <div v-if="detailOrder.user_name">
                <span class="text-gray-500">{{ $t('admin.orders.userName') }}:</span>
                <span class="ml-2 text-charcoal">{{ detailOrder.user_name }}</span>
              </div>
            </div>
          </div>
          <div v-if="detailOrder.items && detailOrder.items.length > 0">
            <h4 class="text-sm font-medium text-gray-900 mb-3">{{ $t('admin.orders.orderItems') }}</h4>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{{ $t('admin.orders.items.serviceName') }}</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{{ $t('admin.orders.items.tokens') }}</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{{ $t('admin.orders.items.price') }}</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{{ $t('admin.orders.items.quantity') }}</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{{ $t('admin.orders.items.subtotal') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="item in detailOrder.items" :key="item.id">
                    <td class="px-4 py-2 text-sm text-charcoal">{{ item.service_name }}</td>
                    <td class="px-4 py-2 text-sm text-gray-500 text-right">{{ formatNumber(item.tokens) }}</td>
                    <td class="px-4 py-2 text-sm text-gray-500 text-right">¥{{ item.price }}</td>
                    <td class="px-4 py-2 text-sm text-gray-500 text-right">{{ item.quantity }}</td>
                    <td class="px-4 py-2 text-sm text-charcoal text-right">¥{{ item.subtotal }}</td>
                  </tr>
                </tbody>
                <tfoot class="bg-gray-50">
                  <tr>
                    <td colspan="4" class="px-4 py-2 text-sm font-medium text-charcoal text-right">{{ $t('admin.orders.total') }}</td>
                    <td class="px-4 py-2 text-sm font-bold text-charcoal text-right">¥{{ detailOrder.total_amount }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-white">
          <button
            @click="closeDetailModal"
            class="btn-outline px-4 py-2 text-sm"
          >
            {{ $t('admin.common.close') }}
          </button>
          <NuxtLink
            v-if="detailOrder"
            :to="`/admin/orders/${detailOrder.id}`"
            class="btn-primary px-4 py-2 text-sm"
          >
            {{ $t('admin.orders.viewFullDetail') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { t } = useI18n()
const auth = useAuth()

useHead({
  title: () => t('admin.orders.title')
})

interface Order {
  id: number
  order_no: string
  user_id: number
  user_email: string
  user_name: string | null
  total_amount: number
  total_tokens: number
  status: string
  created_at: string
}

interface Stats {
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  todayRevenue: number
}

const orders = ref<Order[]>([])
const stats = ref<Stats | null>(null)
const searchQuery = ref('')
const statusFilter = ref('')
const startDate = ref('')
const endDate = ref('')
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
})

const showDetailModal = ref(false)
const detailLoading = ref(false)
const detailOrder = ref<(Order & { items: OrderItem[]; paid_at: string | null; payment_method: string | null }) | null>(null)

interface OrderItem {
  id: number
  service_id: number
  service_name: string
  tokens: number
  price: number
  quantity: number
  subtotal: number
}

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

const loadOrders = async () => {
  try {
    const params = new URLSearchParams()
    params.append('page', pagination.value.page.toString())
    params.append('limit', pagination.value.limit.toString())
    params.append('stats', 'true')
    
    if (searchQuery.value) params.append('search', searchQuery.value)
    if (statusFilter.value) params.append('status', statusFilter.value)
    if (startDate.value) params.append('startDate', startDate.value)
    if (endDate.value) params.append('endDate', endDate.value)

    const res = await $fetch(`/api/admin/orders?${params.toString()}`, {
      headers: auth.getAuthHeaders()
    })
    if (res.success) {
      orders.value = res.data.orders
      pagination.value = res.data.pagination
      stats.value = res.data.stats
    }
  } catch (error) {
    console.error('Failed to load orders:', error)
  }
}

const confirmPayment = async (order: Order) => {
  if (!confirm(t('admin.orders.confirmPaymentMessage'))) return
  
  try {
    await $fetch(`/api/admin/orders/${order.id}/status`, {
      method: 'PUT',
      headers: auth.getAuthHeaders(),
      body: { 
        status: 'paid',
        payment_method: 'admin_confirm'
      }
    })
    await loadOrders()
  } catch (error) {
    console.error('Failed to confirm payment:', error)
  }
}

const changePage = (page: number) => {
  pagination.value.page = page
  loadOrders()
}

const viewOrder = async (order: Order) => {
  showDetailModal.value = true
  detailLoading.value = true
  detailOrder.value = null
  
  try {
    const res = await $fetch(`/api/admin/orders/${order.id}`, {
      headers: auth.getAuthHeaders()
    }) as any
    if (res.success) {
      detailOrder.value = res.data
    }
  } catch (error) {
    console.error('Failed to load order detail:', error)
  } finally {
    detailLoading.value = false
  }
}

const closeDetailModal = () => {
  showDetailModal.value = false
  detailOrder.value = null
}

onMounted(() => {
  loadOrders()
})
</script>
