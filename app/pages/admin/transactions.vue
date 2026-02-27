<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-medium text-charcoal">{{ $t('admin.transactions.transactionList') }}</h2>
        <p class="text-sm text-gray-500 mt-1">{{ $t('admin.transactions.description') }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-sm text-gray-600">{{ $t('admin.transactions.totalPurchased') }}</p>
        <p class="text-xl font-bold text-charcoal">{{ formatNumber(stats?.totalPurchased || 0) }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-sm text-gray-600">{{ $t('admin.transactions.totalConsumed') }}</p>
        <p class="text-xl font-bold text-charcoal">{{ formatNumber(stats?.totalConsumed || 0) }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-sm text-gray-600">{{ $t('admin.transactions.totalRefunded') }}</p>
        <p class="text-xl font-bold text-charcoal">{{ formatNumber(stats?.totalRefunded || 0) }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-sm text-gray-600">{{ $t('admin.transactions.totalGifted') }}</p>
        <p class="text-xl font-bold text-charcoal">{{ formatNumber(stats?.totalGifted || 0) }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-sm text-gray-600">{{ $t('admin.transactions.netChange') }}</p>
        <p class="text-xl font-bold" :class="(stats?.netChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'">
          {{ (stats?.netChange || 0) >= 0 ? '+' : '' }}{{ formatNumber(stats?.netChange || 0) }}
        </p>
      </div>
    </div>

    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <div class="flex flex-wrap gap-4">
        <select 
          v-model="typeFilter"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo focus:border-indigo"
          @change="loadTransactions"
        >
          <option value="">{{ $t('admin.transactions.allTypes') }}</option>
          <option value="purchase">{{ $t('admin.transactions.typePurchase') }}</option>
          <option value="consume">{{ $t('admin.transactions.typeConsume') }}</option>
          <option value="refund">{{ $t('admin.transactions.typeRefund') }}</option>
          <option value="gift">{{ $t('admin.transactions.typeGift') }}</option>
        </select>
        <input 
          v-model="startDate"
          type="date"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo focus:border-indigo"
          @change="loadTransactions"
        />
        <input 
          v-model="endDate"
          type="date"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo focus:border-indigo"
          @change="loadTransactions"
        />
      </div>
    </div>

    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.transactions.table.user') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.transactions.table.type') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.transactions.table.amount') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.transactions.table.balanceAfter') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.transactions.table.description') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.transactions.table.createdAt') }}</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div>
                <div class="text-sm text-charcoal">{{ tx.user_name || tx.user_email }}</div>
                <div class="text-xs text-gray-500">{{ tx.user_email }}</div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="{
                  'bg-green-100 text-green-800': tx.type === 'purchase',
                  'bg-blue-100 text-blue-800': tx.type === 'consume',
                  'bg-yellow-100 text-yellow-800': tx.type === 'refund',
                  'bg-purple-100 text-purple-800': tx.type === 'gift'
                }"
              >
                {{ getTypeText(tx.type) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm" :class="tx.amount >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ tx.amount >= 0 ? '+' : '' }}{{ formatNumber(tx.amount) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatNumber(tx.balance_after) }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
              {{ tx.description || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDateTime(tx.created_at) }}
            </td>
          </tr>
          <tr v-if="transactions.length === 0">
            <td colspan="6" class="px-6 py-12 text-center text-gray-500">
              {{ $t('admin.transactions.noTransactions') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="pagination.totalPages > 1" class="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
      <div class="text-sm text-gray-500">
        {{ $t('admin.transactions.pagination', { from: (pagination.page - 1) * pagination.limit + 1, to: Math.min(pagination.page * pagination.limit, pagination.total), total: pagination.total }) }}
      </div>
      <div class="flex gap-2">
        <button 
          @click="changePage(pagination.page - 1)"
          :disabled="pagination.page === 1"
          class="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50"
        >
          {{ $t('admin.transactions.prevPage') }}
        </button>
        <button 
          @click="changePage(pagination.page + 1)"
          :disabled="pagination.page === pagination.totalPages"
          class="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50"
        >
          {{ $t('admin.transactions.nextPage') }}
        </button>
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
  title: () => t('admin.transactions.title')
})

interface Transaction {
  id: number
  user_id: number
  user_email: string
  user_name: string | null
  type: string
  amount: number
  balance_after: number
  description: string | null
  created_at: string
}

interface Stats {
  totalPurchased: number
  totalConsumed: number
  totalRefunded: number
  totalGifted: number
  netChange: number
}

const transactions = ref<Transaction[]>([])
const stats = ref<Stats | null>(null)
const typeFilter = ref('')
const startDate = ref('')
const endDate = ref('')
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
})

const formatNumber = (num: number) => {
  return num?.toLocaleString() || '0'
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString()
}

const getTypeText = (type: string) => {
  switch (type) {
    case 'purchase': return t('admin.transactions.typePurchase')
    case 'consume': return t('admin.transactions.typeConsume')
    case 'refund': return t('admin.transactions.typeRefund')
    case 'gift': return t('admin.transactions.typeGift')
    default: return type
  }
}

const loadTransactions = async () => {
  try {
    const params = new URLSearchParams()
    params.append('page', pagination.value.page.toString())
    params.append('limit', pagination.value.limit.toString())
    params.append('stats', 'true')
    
    if (typeFilter.value) params.append('type', typeFilter.value)
    if (startDate.value) params.append('startDate', startDate.value)
    if (endDate.value) params.append('endDate', endDate.value)

    const res = await $fetch(`/api/admin/transactions?${params.toString()}`, {
      headers: auth.getAuthHeaders()
    })
    if (res.success) {
      transactions.value = res.data.transactions
      pagination.value = res.data.pagination
      stats.value = res.data.stats
    }
  } catch (error) {
    console.error('Failed to load transactions:', error)
  }
}

const changePage = (page: number) => {
  pagination.value.page = page
  loadTransactions()
}

onMounted(() => {
  loadTransactions()
})
</script>
