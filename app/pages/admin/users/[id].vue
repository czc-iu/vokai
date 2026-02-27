<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <NuxtLink 
        to="/admin/users"
        class="text-gray-500 hover:text-gray-700"
      >
        <Icon name="heroicons:arrow-left" class="w-5 h-5" />
      </NuxtLink>
      <div>
        <h2 class="text-lg font-medium text-charcoal">{{ $t('admin.users.userDetail') }}</h2>
        <p class="text-sm text-gray-500">{{ userEmail }}</p>
      </div>
    </div>

    <ClientOnly>
      <div v-if="loading" class="text-center py-12">
        {{ $t('common.loading') }}
      </div>

      <div v-else-if="user" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-sm font-medium text-gray-900 mb-4">{{ $t('admin.users.basicInfo') }}</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-gray-500 mb-1">{{ $t('admin.users.form.email') }}</label>
                <p class="text-sm text-charcoal">{{ user.email }}</p>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">{{ $t('admin.users.form.name') }}</label>
                <input 
                  v-model="editForm.name"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo focus:border-indigo"
                />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">{{ $t('admin.users.form.phone') }}</label>
                <input 
                  v-model="editForm.phone"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo focus:border-indigo"
                />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">{{ $t('admin.users.form.company') }}</label>
                <input 
                  v-model="editForm.company"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo focus:border-indigo"
                />
              </div>
            </div>
            <div class="mt-4 flex justify-end">
              <button 
                @click="saveUserInfo"
                class="px-4 py-2 text-sm font-medium text-white bg-indigo rounded-lg hover:bg-indigo-dark"
              >
                {{ $t('admin.common.save') }}
              </button>
            </div>
          </div>

          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-sm font-medium text-gray-900 mb-4">{{ $t('admin.users.activityInfo') }}</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center p-4 bg-gray-50 rounded-lg">
                <p class="text-2xl font-bold text-charcoal">{{ activity?.totalConversations || 0 }}</p>
                <p class="text-xs text-gray-500">{{ $t('admin.users.conversations') }}</p>
              </div>
              <div class="text-center p-4 bg-gray-50 rounded-lg">
                <p class="text-2xl font-bold text-charcoal">{{ formatNumber(activity?.totalMessages || 0) }}</p>
                <p class="text-xs text-gray-500">{{ $t('admin.users.messages') }}</p>
              </div>
              <div class="text-center p-4 bg-gray-50 rounded-lg">
                <p class="text-2xl font-bold text-charcoal">{{ formatNumber(activity?.totalTokensConsumed || 0) }}</p>
                <p class="text-xs text-gray-500">{{ $t('admin.users.tokensConsumed') }}</p>
              </div>
              <div class="text-center p-4 bg-gray-50 rounded-lg">
                <p class="text-sm font-medium text-charcoal">{{ activity?.lastActiveAt ? formatDate(activity.lastActiveAt) : '-' }}</p>
                <p class="text-xs text-gray-500">{{ $t('admin.users.lastActive') }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-sm font-medium text-gray-900 mb-4">{{ $t('admin.users.accountStatus') }}</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-xs text-gray-500 mb-1">{{ $t('admin.users.form.status') }}</label>
                <select 
                  v-model="statusForm.status"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo focus:border-indigo"
                >
                  <option value="active">{{ $t('admin.users.statusActive') }}</option>
                  <option value="inactive">{{ $t('admin.users.statusInactive') }}</option>
                  <option value="suspended">{{ $t('admin.users.statusSuspended') }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">{{ $t('admin.users.form.role') }}</label>
                <select 
                  v-model="statusForm.role"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo focus:border-indigo"
                >
                  <option value="user">{{ $t('admin.users.roleUser') }}</option>
                  <option value="admin">{{ $t('admin.users.roleAdmin') }}</option>
                </select>
              </div>
              <button 
                @click="saveStatus"
                class="w-full px-4 py-2 text-sm font-medium text-white bg-indigo rounded-lg hover:bg-indigo-dark"
              >
                {{ $t('admin.users.updateStatus') }}
              </button>
            </div>
          </div>

          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-sm font-medium text-gray-900 mb-4">{{ $t('admin.users.tokenBalance') }}</h3>
            <div class="text-center py-4">
              <p class="text-3xl font-bold text-charcoal">{{ formatNumber(user.balance) }}</p>
              <p class="text-sm text-gray-500">tokens</p>
            </div>
            <div class="space-y-3">
              <div>
                <label class="block text-xs text-gray-500 mb-1">{{ $t('admin.users.adjustAmount') }}</label>
                <input 
                  v-model.number="balanceForm.amount"
                  type="number"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo focus:border-indigo"
                />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">{{ $t('admin.users.adjustType') }}</label>
                <select 
                  v-model="balanceForm.type"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo focus:border-indigo"
                >
                  <option value="gift">{{ $t('admin.users.typeGift') }}</option>
                  <option value="purchase">{{ $t('admin.users.typePurchase') }}</option>
                  <option value="consume">{{ $t('admin.users.typeConsume') }}</option>
                  <option value="refund">{{ $t('admin.users.typeRefund') }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">{{ $t('admin.users.adjustReason') }}</label>
                <input 
                  v-model="balanceForm.description"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo focus:border-indigo"
                />
              </div>
              <button 
                @click="adjustBalance"
                class="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                {{ $t('admin.users.adjustBalance') }}
              </button>
            </div>
          </div>

          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-sm font-medium text-gray-900 mb-4">{{ $t('admin.users.statistics') }}</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">{{ $t('admin.users.totalPurchased') }}</span>
                <span class="text-charcoal">{{ formatNumber(user.total_purchased) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">{{ $t('admin.users.totalConsumed') }}</span>
                <span class="text-charcoal">{{ formatNumber(user.total_consumed) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">{{ $t('admin.users.createdAt') }}</span>
                <span class="text-charcoal">{{ formatDate(user.created_at) }}</span>
              </div>
              <div v-if="user.last_login_at" class="flex justify-between">
                <span class="text-gray-500">{{ $t('admin.users.lastLogin') }}</span>
                <span class="text-charcoal">{{ formatDate(user.last_login_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12 text-gray-500">
        {{ $t('admin.users.userNotFound') }}
      </div>

      <template #fallback>
        <div class="text-center py-12">
          {{ $t('common.loading') }}
        </div>
      </template>
    </ClientOnly>
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

const userId = computed(() => parseInt(route.params.id as string))

useHead({
  title: () => t('admin.users.userDetail')
})

interface User {
  id: number
  email: string
  name: string | null
  phone: string | null
  company: string | null
  role: string
  status: string
  balance: number
  total_purchased: number
  total_consumed: number
  created_at: string
  last_login_at: string | null
}

interface Activity {
  totalConversations: number
  totalMessages: number
  totalTokensConsumed: number
  lastActiveAt: string | null
}

const loading = ref(true)
const user = ref<User | null>(null)
const activity = ref<Activity | null>(null)

const userEmail = computed(() => user.value?.email || '...')

const editForm = ref({
  name: '',
  phone: '',
  company: ''
})

const statusForm = ref({
  status: 'active',
  role: 'user'
})

const balanceForm = ref({
  amount: 0,
  type: 'gift',
  description: ''
})

const formatNumber = (num: number) => {
  return num?.toLocaleString() || '0'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const loadUser = async () => {
  loading.value = true
  try {
    const res = await $fetch(`/api/admin/users/${userId.value}`, {
      headers: auth.getAuthHeaders()
    }) as any
    if (res.success) {
      user.value = res.data.user
      activity.value = res.data.activity
      editForm.value = {
        name: res.data.user.name || '',
        phone: res.data.user.phone || '',
        company: res.data.user.company || ''
      }
      statusForm.value = {
        status: res.data.user.status,
        role: res.data.user.role
      }
    }
  } catch (error) {
    console.error('Failed to load user:', error)
  } finally {
    loading.value = false
  }
}

const saveUserInfo = async () => {
  try {
    await $fetch(`/api/admin/users/${userId.value}`, {
      method: 'PUT',
      headers: auth.getAuthHeaders(),
      body: editForm.value
    })
    await loadUser()
  } catch (error) {
    console.error('Failed to save user info:', error)
  }
}

const saveStatus = async () => {
  try {
    if (statusForm.value.status !== user.value?.status) {
      await $fetch(`/api/admin/users/${userId.value}/status`, {
        method: 'PUT',
        headers: auth.getAuthHeaders(),
        body: { status: statusForm.value.status }
      })
    }
    if (statusForm.value.role !== user.value?.role) {
      await $fetch(`/api/admin/users/${userId.value}/role`, {
        method: 'PUT',
        headers: auth.getAuthHeaders(),
        body: { role: statusForm.value.role }
      })
    }
    await loadUser()
  } catch (error) {
    console.error('Failed to save status:', error)
  }
}

const adjustBalance = async () => {
  if (!balanceForm.value.amount) return
  
  try {
    await $fetch(`/api/admin/users/${userId.value}/balance`, {
      method: 'POST',
      headers: auth.getAuthHeaders(),
      body: balanceForm.value
    })
    balanceForm.value = { amount: 0, type: 'gift', description: '' }
    await loadUser()
  } catch (error) {
    console.error('Failed to adjust balance:', error)
  }
}

onMounted(() => {
  loadUser()
})
</script>
