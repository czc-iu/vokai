<template>
  <div class="space-y-6">
    <ClientOnly>
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-medium text-charcoal">{{ $t('admin.users.userList') }}</h2>
          <p class="text-sm text-gray-500 mt-1">{{ $t('admin.users.description') }}</p>
        </div>
      </div>

      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex flex-wrap gap-4">
          <div class="flex-1 min-w-[200px]">
            <input 
              v-model="searchQuery"
              type="text"
              :placeholder="$t('admin.users.searchPlaceholder')"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo focus:border-indigo"
              @keyup.enter="loadUsers"
            />
          </div>
          <select 
            v-model="statusFilter"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo focus:border-indigo"
            @change="loadUsers"
          >
            <option value="">{{ $t('admin.users.allStatus') }}</option>
            <option value="active">{{ $t('admin.users.statusActive') }}</option>
            <option value="inactive">{{ $t('admin.users.statusInactive') }}</option>
            <option value="suspended">{{ $t('admin.users.statusSuspended') }}</option>
          </select>
          <select 
            v-model="roleFilter"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo focus:border-indigo"
            @change="loadUsers"
          >
            <option value="">{{ $t('admin.users.allRoles') }}</option>
            <option value="user">{{ $t('admin.users.roleUser') }}</option>
            <option value="admin">{{ $t('admin.users.roleAdmin') }}</option>
          </select>
          <button 
            @click="loadUsers"
            class="px-4 py-2 bg-indigo text-white text-sm font-medium rounded-lg hover:bg-indigo-dark"
          >
            {{ $t('admin.users.search') }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <p class="text-sm text-gray-600">{{ $t('admin.users.totalUsers') }}</p>
          <p class="text-2xl font-bold text-charcoal">{{ stats?.totalUsers || 0 }}</p>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <p class="text-sm text-gray-600">{{ $t('admin.users.activeUsers') }}</p>
          <p class="text-2xl font-bold text-charcoal">{{ stats?.activeUsers || 0 }}</p>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <p class="text-sm text-gray-600">{{ $t('admin.users.newUsersToday') }}</p>
          <p class="text-2xl font-bold text-charcoal">{{ stats?.newUsersToday || 0 }}</p>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <p class="text-sm text-gray-600">{{ $t('admin.users.newUsersThisMonth') }}</p>
          <p class="text-2xl font-bold text-charcoal">{{ stats?.newUsersThisMonth || 0 }}</p>
        </div>
      </div>

      <div v-if="loading" class="text-center py-12">
        {{ $t('common.loading') }}
      </div>

      <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.users.table.user') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.users.table.role') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.users.table.status') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.users.table.balance') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.users.table.createdAt') }}</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.users.table.actions') }}</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div>
                <div class="text-sm font-medium text-charcoal">{{ user.name || user.email }}</div>
                <div class="text-sm text-gray-500">{{ user.email }}</div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'"
              >
                {{ user.role === 'admin' ? $t('admin.users.roleAdmin') : $t('admin.users.roleUser') }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="{
                  'bg-green-100 text-green-800': user.status === 'active',
                  'bg-gray-100 text-gray-800': user.status === 'inactive',
                  'bg-red-100 text-red-800': user.status === 'suspended'
                }"
              >
                {{ getStatusText(user.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ formatNumber(user.balance) }} tokens
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(user.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
              <button 
                @click="viewUser(user)"
                class="text-indigo hover:text-indigo-dark cursor-pointer"
              >
                {{ $t('admin.users.viewDetail') }}
              </button>
            </td>
          </tr>
          <tr v-if="users.length === 0">
            <td colspan="6" class="px-6 py-12 text-center text-gray-500">
              {{ $t('admin.users.noUsers') }}
            </td>
          </tr>
        </tbody>
        </table>
      </div>

      <div v-if="pagination.totalPages > 1" class="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
        <div class="text-sm text-gray-500">
          {{ $t('admin.users.pagination', { from: (pagination.page - 1) * pagination.limit + 1, to: Math.min(pagination.page * pagination.limit, pagination.total), total: pagination.total }) }}
        </div>
        <div class="flex gap-2">
          <button 
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            {{ $t('admin.users.prevPage') }}
          </button>
          <button 
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page === pagination.totalPages"
            class="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            {{ $t('admin.users.nextPage') }}
          </button>
        </div>
      </div>
      <template #fallback>
        <div class="text-center py-12">
          {{ $t('common.loading') }}
        </div>
      </template>
    </ClientOnly>

    <div v-if="showDetailModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h3 class="text-lg font-medium text-charcoal">{{ $t('admin.users.userDetail') }}</h3>
          <button @click="closeDetailModal" class="text-gray-400 hover:text-gray-600">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>
        <div v-if="detailLoading" class="p-6 text-center">
          {{ $t('common.loading') }}
        </div>
        <div v-else-if="detailUser" class="p-6 space-y-6">
          <div>
            <h4 class="text-sm font-medium text-gray-900 mb-3">{{ $t('admin.users.basicInfo') }}</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500">{{ $t('admin.users.form.email') }}:</span>
                <span class="ml-2 text-charcoal">{{ detailUser.email }}</span>
              </div>
              <div>
                <span class="text-gray-500">{{ $t('admin.users.form.name') }}:</span>
                <span class="ml-2 text-charcoal">{{ detailUser.name || '-' }}</span>
              </div>
              <div>
                <span class="text-gray-500">{{ $t('admin.users.form.phone') }}:</span>
                <span class="ml-2 text-charcoal">{{ detailUser.phone || '-' }}</span>
              </div>
              <div>
                <span class="text-gray-500">{{ $t('admin.users.form.company') }}:</span>
                <span class="ml-2 text-charcoal">{{ detailUser.company || '-' }}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 class="text-sm font-medium text-gray-900 mb-3">{{ $t('admin.users.accountStatus') }}</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500">{{ $t('admin.users.form.role') }}:</span>
                <span 
                  class="ml-2 px-2 py-1 text-xs font-medium rounded-full"
                  :class="detailUser.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'"
                >
                  {{ detailUser.role === 'admin' ? $t('admin.users.roleAdmin') : $t('admin.users.roleUser') }}
                </span>
              </div>
              <div>
                <span class="text-gray-500">{{ $t('admin.users.form.status') }}:</span>
                <span 
                  class="ml-2 px-2 py-1 text-xs font-medium rounded-full"
                  :class="{
                    'bg-green-100 text-green-800': detailUser.status === 'active',
                    'bg-gray-100 text-gray-800': detailUser.status === 'inactive',
                    'bg-red-100 text-red-800': detailUser.status === 'suspended'
                  }"
                >
                  {{ getStatusText(detailUser.status) }}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h4 class="text-sm font-medium text-gray-900 mb-3">{{ $t('admin.users.tokenBalance') }}</h4>
            <div class="text-center py-4 bg-gray-50 rounded-lg">
              <p class="text-3xl font-bold text-charcoal">{{ formatNumber(detailUser.balance) }}</p>
              <p class="text-sm text-gray-500">tokens</p>
            </div>
          </div>
          <div>
            <h4 class="text-sm font-medium text-gray-900 mb-3">{{ $t('admin.users.activityInfo') }}</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center p-4 bg-gray-50 rounded-lg">
                <p class="text-2xl font-bold text-charcoal">{{ detailActivity?.totalConversations || 0 }}</p>
                <p class="text-xs text-gray-500">{{ $t('admin.users.conversations') }}</p>
              </div>
              <div class="text-center p-4 bg-gray-50 rounded-lg">
                <p class="text-2xl font-bold text-charcoal">{{ formatNumber(detailActivity?.totalMessages || 0) }}</p>
                <p class="text-xs text-gray-500">{{ $t('admin.users.messages') }}</p>
              </div>
              <div class="text-center p-4 bg-gray-50 rounded-lg">
                <p class="text-2xl font-bold text-charcoal">{{ formatNumber(detailActivity?.totalTokensConsumed || 0) }}</p>
                <p class="text-xs text-gray-500">{{ $t('admin.users.tokensConsumed') }}</p>
              </div>
              <div class="text-center p-4 bg-gray-50 rounded-lg">
                <p class="text-sm font-medium text-charcoal">{{ detailActivity?.lastActiveAt ? formatDate(detailActivity.lastActiveAt) : '-' }}</p>
                <p class="text-xs text-gray-500">{{ $t('admin.users.lastActive') }}</p>
              </div>
            </div>
          </div>
          <div>
            <h4 class="text-sm font-medium text-gray-900 mb-3">{{ $t('admin.users.statistics') }}</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">{{ $t('admin.users.totalPurchased') }}</span>
                <span class="text-charcoal">{{ formatNumber(detailUser.total_purchased) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">{{ $t('admin.users.totalConsumed') }}</span>
                <span class="text-charcoal">{{ formatNumber(detailUser.total_consumed) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">{{ $t('admin.users.createdAt') }}</span>
                <span class="text-charcoal">{{ formatDate(detailUser.created_at) }}</span>
              </div>
              <div v-if="detailUser.last_login_at" class="flex justify-between">
                <span class="text-gray-500">{{ $t('admin.users.lastLogin') }}</span>
                <span class="text-charcoal">{{ formatDate(detailUser.last_login_at) }}</span>
              </div>
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
            :to="`/admin/users/${detailUser?.id}`"
            class="btn-primary px-4 py-2 text-sm"
          >
            {{ $t('admin.users.editUser') }}
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
  title: () => t('admin.users.title')
})

interface User {
  id: number
  email: string
  name: string | null
  role: string
  status: string
  balance: number
  created_at: string
}

interface Stats {
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  newUsersThisMonth: number
}

const users = ref<User[]>([])
const stats = ref<Stats | null>(null)
const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('')
const roleFilter = ref('')
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
})

const showDetailModal = ref(false)
const detailLoading = ref(false)
const detailUser = ref<User & { phone: string | null; company: string | null; total_purchased: number; total_consumed: number; last_login_at: string | null } | null>(null)
const detailActivity = ref<{ totalConversations: number; totalMessages: number; totalTokensConsumed: number; lastActiveAt: string | null } | null>(null)

const formatNumber = (num: number) => {
  return num?.toLocaleString() || '0'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return t('admin.users.statusActive')
    case 'inactive': return t('admin.users.statusInactive')
    case 'suspended': return t('admin.users.statusSuspended')
    default: return status
  }
}

const loadUsers = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    params.append('page', pagination.value.page.toString())
    params.append('limit', pagination.value.limit.toString())
    params.append('stats', 'true')
    
    if (searchQuery.value) params.append('search', searchQuery.value)
    if (statusFilter.value) params.append('status', statusFilter.value)
    if (roleFilter.value) params.append('role', roleFilter.value)

    const res = await $fetch(`/api/admin/users?${params.toString()}`, {
      headers: auth.getAuthHeaders()
    })
    if (res.success) {
      users.value = res.data.users
      pagination.value = res.data.pagination
      stats.value = res.data.stats
    }
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    loading.value = false
  }
}

const changePage = (page: number) => {
  pagination.value.page = page
  loadUsers()
}

const viewUser = async (user: User) => {
  showDetailModal.value = true
  detailLoading.value = true
  detailUser.value = null
  detailActivity.value = null
  
  try {
    const res = await $fetch(`/api/admin/users/${user.id}`, {
      headers: auth.getAuthHeaders()
    }) as any
    if (res.success) {
      detailUser.value = res.data.user
      detailActivity.value = res.data.activity
    }
  } catch (error) {
    console.error('Failed to load user detail:', error)
  } finally {
    detailLoading.value = false
  }
}

const closeDetailModal = () => {
  showDetailModal.value = false
  detailUser.value = null
  detailActivity.value = null
}

onMounted(() => {
  loadUsers()
})
</script>
