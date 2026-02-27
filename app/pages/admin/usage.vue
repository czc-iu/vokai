<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-medium text-charcoal">{{ $t('admin.usage.usageStats') }}</h2>
        <p class="text-sm text-gray-500 mt-1">{{ $t('admin.usage.description') }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-sm text-gray-600">{{ $t('admin.usage.totalTokensConsumed') }}</p>
        <p class="text-2xl font-bold text-charcoal">{{ formatNumber(summary?.totalTokensConsumed || 0) }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-sm text-gray-600">{{ $t('admin.usage.totalConversations') }}</p>
        <p class="text-2xl font-bold text-charcoal">{{ formatNumber(summary?.totalConversations || 0) }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-sm text-gray-600">{{ $t('admin.usage.todayTokensConsumed') }}</p>
        <p class="text-2xl font-bold text-charcoal">{{ formatNumber(summary?.todayTokensConsumed || 0) }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-sm text-gray-600">{{ $t('admin.usage.activeUsersToday') }}</p>
        <p class="text-2xl font-bold text-charcoal">{{ formatNumber(summary?.activeUsersToday || 0) }}</p>
      </div>
    </div>

    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <h3 class="text-sm font-medium text-gray-900 mb-4">{{ $t('admin.usage.trendChart') }}</h3>
      <div class="h-64 flex items-end gap-1">
        <div 
          v-for="(item, index) in chartData" 
          :key="index"
          class="flex-1 flex flex-col justify-end items-center h-full"
        >
          <div 
            class="w-full bg-indigo rounded-t transition-all duration-200"
            :style="{ height: `${getBarHeight(item.tokens)}%` }"
            :title="`${item.date}: ${formatNumber(item.tokens)} tokens`"
          ></div>
        </div>
      </div>
      <div class="mt-4 flex justify-between text-xs text-gray-400 overflow-hidden">
        <span v-for="(item, index) in chartData" :key="`label-${index}`" class="flex-1 text-center truncate">
          {{ formatDateShort(item.date) }}
        </span>
      </div>
      <div class="mt-4 flex justify-center gap-6 text-xs text-gray-500">
        <span>{{ $t('admin.usage.maxTokens') }}: {{ formatNumber(maxTokens) }}</span>
      </div>
    </div>

    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-sm font-medium text-gray-900">{{ $t('admin.usage.dailyStats') }}</h3>
      </div>
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.usage.table.date') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.usage.table.user') }}</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.usage.table.tokens') }}</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.usage.table.conversations') }}</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.usage.table.messages') }}</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="stat in dailyStats" :key="`${stat.date}-${stat.user_id}`" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-charcoal">
              {{ formatDate(stat.date) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div>
                <div class="text-sm text-charcoal">{{ stat.user_name || stat.user_email }}</div>
                <div class="text-xs text-gray-500">{{ stat.user_email }}</div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
              {{ formatNumber(stat.total_tokens) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
              {{ stat.conversation_count }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
              {{ stat.message_count }}
            </td>
          </tr>
          <tr v-if="dailyStats.length === 0">
            <td colspan="5" class="px-6 py-12 text-center text-gray-500">
              {{ $t('admin.usage.noStats') }}
            </td>
          </tr>
        </tbody>
      </table>
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
  title: () => t('admin.usage.title')
})

interface DailyStat {
  date: string
  user_id: number
  user_email: string
  user_name: string | null
  total_tokens: number
  conversation_count: number
  message_count: number
}

interface Summary {
  totalTokensConsumed: number
  totalConversations: number
  todayTokensConsumed: number
  activeUsersToday: number
}

const dailyStats = ref<DailyStat[]>([])
const summary = ref<Summary | null>(null)

const chartData = computed(() => {
  const dateMap = new Map<string, { date: string; tokens: number }>()
  
  for (const stat of dailyStats.value) {
    const existing = dateMap.get(stat.date)
    if (existing) {
      existing.tokens += stat.total_tokens
    } else {
      dateMap.set(stat.date, { date: stat.date, tokens: stat.total_tokens })
    }
  }
  
  return Array.from(dateMap.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30)
})

const maxTokens = computed(() => {
  return Math.max(...chartData.value.map(d => d.tokens), 1)
})

const getBarHeight = (tokens: number) => {
  return (tokens / maxTokens.value) * 100
}

const formatNumber = (num: number) => {
  return num?.toLocaleString() || '0'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const formatDateShort = (date: string) => {
  const d = new Date(date)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

const loadData = async () => {
  try {
    const res = await $fetch('/api/admin/usage/daily?limit=200', {
      headers: auth.getAuthHeaders()
    })
    if (res.success) {
      dailyStats.value = res.data.daily
      summary.value = res.data.summary
    }
  } catch (error) {
    console.error('Failed to load usage data:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>
