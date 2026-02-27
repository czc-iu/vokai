<template>
  <div class="min-h-[calc(100vh-4rem)] py-8">
    <div class="container-zen">
      <h1 class="text-2xl font-medium text-charcoal mb-8">消费明细</h1>

      <!-- 余额概览 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-gradient-to-br from-indigo to-charcoal rounded-sm p-6 text-white">
          <p class="text-sm opacity-80 mb-1">当前余额</p>
          <p class="text-3xl font-medium">{{ formatNumber(balance.balance) }}</p>
          <p class="text-xs opacity-60 mt-1">tokens</p>
        </div>
        <div class="bg-white rounded-sm border border-sakura p-6">
          <p class="text-sm text-stone mb-1">累计购买</p>
          <p class="text-2xl font-medium text-charcoal">{{ formatNumber(balance.totalPurchased) }}</p>
          <p class="text-xs text-stone mt-1">tokens</p>
        </div>
        <div class="bg-white rounded-sm border border-sakura p-6">
          <p class="text-sm text-stone mb-1">累计消耗</p>
          <p class="text-2xl font-medium text-charcoal">{{ formatNumber(balance.totalConsumed) }}</p>
          <p class="text-xs text-stone mt-1">tokens</p>
        </div>
        <div class="bg-white rounded-sm border border-sakura p-6">
          <p class="text-sm text-stone mb-1">本月消耗</p>
          <p class="text-2xl font-medium text-charcoal">{{ formatNumber(balance.monthlyConsumption) }}</p>
          <p class="text-xs text-stone mt-1">tokens</p>
        </div>
      </div>

      <!-- 充值按钮 -->
      <div class="mb-8">
        <NuxtLink to="/services" class="btn-primary inline-flex items-center gap-2">
          <Icon name="heroicons:plus" class="w-5 h-5" />
          充值购买
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 交易记录 -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-sm border border-sakura">
            <div class="p-4 border-b border-sakura flex items-center justify-between">
              <h2 class="text-lg font-medium text-charcoal">交易记录</h2>
              <select v-model="filterType" class="input-field w-auto text-sm py-1">
                <option value="">全部</option>
                <option value="purchase">购买</option>
                <option value="consume">消耗</option>
                <option value="refund">退款</option>
                <option value="gift">赠送</option>
              </select>
            </div>
            <div v-if="transactions.length === 0" class="p-8 text-center text-stone">
              暂无交易记录
            </div>
            <div v-else class="divide-y divide-sakura">
              <div
                v-for="tx in transactions"
                :key="tx.id"
                class="p-4 flex items-center justify-between"
              >
                <div>
                  <p class="text-charcoal">{{ tx.description || getTypeLabel(tx.type) }}</p>
                  <p class="text-xs text-stone">{{ formatDateTime(tx.created_at) }}</p>
                </div>
                <div class="text-right">
                  <p :class="tx.amount > 0 ? 'text-matcha' : 'text-charcoal'">
                    {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount }}
                  </p>
                  <p class="text-xs text-stone">余额: {{ tx.balance_after }}</p>
                </div>
              </div>
            </div>
            <div v-if="pagination.totalPages > 1" class="p-4 border-t border-sakura flex justify-center gap-2">
              <button
                v-for="page in pagination.totalPages"
                :key="page"
                @click="loadTransactions(page)"
                class="w-8 h-8 rounded-sm text-sm"
                :class="page === pagination.page ? 'bg-indigo text-white' : 'bg-sakura text-charcoal hover:bg-sand'"
              >
                {{ page }}
              </button>
            </div>
          </div>
        </div>

        <!-- 消耗统计 -->
        <div>
          <div class="bg-white rounded-sm border border-sakura p-6">
            <h2 class="text-lg font-medium text-charcoal mb-4">近30天消耗</h2>
            <div v-if="balance.dailyStats && balance.dailyStats.length > 0" class="space-y-2">
              <div
                v-for="stat in balance.dailyStats.slice(0, 10)"
                :key="stat.date"
                class="flex items-center justify-between text-sm"
              >
                <span class="text-stone">{{ stat.date }}</span>
                <span class="text-charcoal">{{ stat.total_tokens }} tokens</span>
              </div>
              <p v-if="balance.dailyStats.length > 10" class="text-xs text-stone text-center pt-2">
                显示最近10天
              </p>
            </div>
            <p v-else class="text-sm text-stone text-center">暂无消耗记录</p>
          </div>
        </div>
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
  title: '费用账单 - TomyBot'
})

interface Transaction {
  id: number
  type: 'purchase' | 'consume' | 'refund' | 'gift'
  amount: number
  balance_after: number
  description: string | null
  created_at: string
}

interface DailyStat {
  date: string
  total_tokens: number
}

const auth = useAuth()

const balance = ref({
  balance: 0,
  totalPurchased: 0,
  totalConsumed: 0,
  monthlyConsumption: 0,
  dailyStats: [] as DailyStat[]
})

const transactions = ref<Transaction[]>([])
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
})

const filterType = ref('')

watch(filterType, () => {
  loadTransactions(1)
})

onMounted(async () => {
  // auth 中间件已经处理了认证，这里只需要加载数据
  await Promise.all([loadBalance(), loadTransactions()])
})

const loadBalance = async () => {
  try {
    const response = await $fetch('/api/billing/balance', {
      headers: auth.getAuthHeaders()
    })
    if (response.success && response.data) {
      balance.value = response.data
    }
  } catch (error) {
    console.error('Failed to load balance:', error)
  }
}

const loadTransactions = async (page = 1) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20'
    })
    if (filterType.value) {
      params.append('type', filterType.value)
    }

    const response = await $fetch(`/api/billing/transactions?${params}`, {
      headers: auth.getAuthHeaders()
    })
    if (response.success && response.data) {
      transactions.value = response.data.transactions
      pagination.value = response.data.pagination
    }
  } catch (error) {
    console.error('Failed to load transactions:', error)
  }
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    purchase: '购买',
    consume: '消耗',
    refund: '退款',
    gift: '赠送'
  }
  return labels[type] || type
}

const formatNumber = (num: number) => {
  return num.toLocaleString()
}

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}
</script>
