<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-indigo/10 rounded-lg flex items-center justify-center">
            <Icon name="heroicons:users" class="w-6 h-6 text-indigo" />
          </div>
          <div>
            <p class="text-sm text-gray-600">{{ $t('admin.dashboard.totalUsers') }}</p>
            <p class="text-2xl font-bold text-charcoal">{{ stats?.users?.totalUsers || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Icon name="heroicons:shopping-bag" class="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p class="text-sm text-gray-600">{{ $t('admin.dashboard.totalOrders') }}</p>
            <p class="text-2xl font-bold text-charcoal">{{ stats?.orders?.totalOrders || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Icon name="heroicons:currency-dollar" class="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p class="text-sm text-gray-600">{{ $t('admin.dashboard.totalRevenue') }}</p>
            <p class="text-2xl font-bold text-charcoal">¥{{ formatNumber(stats?.orders?.totalRevenue || 0) }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Icon name="heroicons:chart-bar" class="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p class="text-sm text-gray-600">{{ $t('admin.dashboard.tokensConsumed') }}</p>
            <p class="text-2xl font-bold text-charcoal">{{ formatNumber(stats?.usage?.totalTokensConsumed || 0) }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <p class="text-sm text-gray-600">{{ $t('admin.dashboard.todayNewUsers') }}</p>
        <p class="text-3xl font-bold text-charcoal">{{ stats?.users?.newUsersToday || 0 }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <p class="text-sm text-gray-600">{{ $t('admin.dashboard.todayRevenue') }}</p>
        <p class="text-3xl font-bold text-charcoal">¥{{ formatNumber(stats?.orders?.todayRevenue || 0) }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <p class="text-sm text-gray-600">{{ $t('admin.dashboard.activeUsersToday') }}</p>
        <p class="text-3xl font-bold text-charcoal">{{ stats?.usage?.activeUsersToday || 0 }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h3 class="text-sm font-medium text-gray-900 mb-4">{{ $t('admin.dashboard.recentTrends') }}</h3>
        <div class="h-48 flex items-end justify-between gap-1">
          <div 
            v-for="(item, index) in trends.slice(-14)" 
            :key="index"
            class="flex-1 flex flex-col items-center"
          >
            <div 
              class="w-full bg-indigo rounded-t transition-all"
              :style="{ height: `${getBarHeight(item.usage?.tokens || 0, maxUsageTokens)}%` }"
              :title="`${item.date}: ${formatNumber(item.usage?.tokens || 0)} tokens`"
            ></div>
          </div>
        </div>
        <p class="mt-2 text-xs text-gray-500 text-center">{{ $t('admin.dashboard.tokenUsageTrend') }}</p>
      </div>

      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h3 class="text-sm font-medium text-gray-900 mb-4">{{ $t('admin.dashboard.revenueTrend') }}</h3>
        <div class="h-48 flex items-end justify-between gap-1">
          <div 
            v-for="(item, index) in trends.slice(-14)" 
            :key="index"
            class="flex-1 flex flex-col items-center"
          >
            <div 
              class="w-full bg-green-500 rounded-t transition-all"
              :style="{ height: `${getBarHeight(item.orders?.revenue || 0, maxRevenue)}%` }"
              :title="`${item.date}: ¥${formatNumber(item.orders?.revenue || 0)}`"
            ></div>
          </div>
        </div>
        <p class="mt-2 text-xs text-gray-500 text-center">{{ $t('admin.dashboard.revenueTrendLabel') }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-gray-900">{{ $t('admin.dashboard.quickActions') }}</h3>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <NuxtLink 
            to="/admin/services"
            class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-indigo hover:bg-indigo/5 transition-colors"
          >
            <Icon name="heroicons:cube" class="w-5 h-5 text-indigo" />
            <span class="text-sm font-medium text-charcoal">{{ $t('admin.dashboard.manageServices') }}</span>
          </NuxtLink>
          <NuxtLink 
            to="/admin/users"
            class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-indigo hover:bg-indigo/5 transition-colors"
          >
            <Icon name="heroicons:users" class="w-5 h-5 text-indigo" />
            <span class="text-sm font-medium text-charcoal">{{ $t('admin.dashboard.manageUsers') }}</span>
          </NuxtLink>
          <NuxtLink 
            to="/admin/orders"
            class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-indigo hover:bg-indigo/5 transition-colors"
          >
            <Icon name="heroicons:shopping-bag" class="w-5 h-5 text-indigo" />
            <span class="text-sm font-medium text-charcoal">{{ $t('admin.dashboard.manageOrders') }}</span>
          </NuxtLink>
          <NuxtLink 
            to="/admin/transactions"
            class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-indigo hover:bg-indigo/5 transition-colors"
          >
            <Icon name="heroicons:currency-dollar" class="w-5 h-5 text-indigo" />
            <span class="text-sm font-medium text-charcoal">{{ $t('admin.dashboard.viewTransactions') }}</span>
          </NuxtLink>
        </div>
      </div>

      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h3 class="text-sm font-medium text-gray-900 mb-4">{{ $t('admin.dashboard.systemStatus') }}</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              <span class="text-sm font-medium text-charcoal">{{ $t('admin.dashboard.database') }}</span>
            </div>
            <span class="text-sm text-green-600">{{ $t('admin.dashboard.connected') }}</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              <span class="text-sm font-medium text-charcoal">{{ $t('admin.dashboard.aiService') }}</span>
            </div>
            <span class="text-sm text-green-600">{{ $t('admin.dashboard.operational') }}</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              <span class="text-sm font-medium text-charcoal">{{ $t('admin.dashboard.tokenBalance') }}</span>
            </div>
            <span class="text-sm text-charcoal">{{ formatNumber(stats?.totalTokenBalance || 0) }}</span>
          </div>
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
  title: () => t('admin.dashboard.title')
})

interface Stats {
  users: {
    totalUsers: number
    activeUsers: number
    newUsersToday: number
    newUsersThisMonth: number
  }
  orders: {
    totalOrders: number
    pendingOrders: number
    totalRevenue: number
    todayRevenue: number
  }
  usage: {
    totalTokensConsumed: number
    activeUsersToday: number
  }
  totalTokenBalance: number
}

interface TrendItem {
  date: string
  usage: { tokens: number }
  orders: { revenue: number }
  users: { newUsers: number }
}

const stats = ref<Stats | null>(null)
const trends = ref<TrendItem[]>([])

const formatNumber = (num: number) => {
  return num?.toLocaleString() || '0'
}

const maxUsageTokens = computed(() => {
  return Math.max(...trends.value.map(t => t.usage?.tokens || 0), 1)
})

const maxRevenue = computed(() => {
  return Math.max(...trends.value.map(t => t.orders?.revenue || 0), 1)
})

const getBarHeight = (value: number, max: number) => {
  return max > 0 ? (value / max) * 100 : 0
}

const loadStats = async () => {
  try {
    const headers = auth.getAuthHeaders()
    const [overviewRes, trendsRes] = await Promise.all([
      $fetch('/api/admin/stats/overview', { headers }),
      $fetch('/api/admin/stats/trends?days=30', { headers })
    ])

    if (overviewRes.success) {
      stats.value = overviewRes.data
    }

    if (trendsRes.success) {
      trends.value = trendsRes.data
    }
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

onMounted(() => {
  loadStats()
})
</script>
