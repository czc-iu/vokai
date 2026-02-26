<template>
  <div class="min-h-[calc(100vh-4rem)] py-8">
    <div class="container-zen">
      <h1 class="text-2xl font-medium text-charcoal mb-8">{{ $t('account.heading') }}</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-sm border border-sakura p-6">
            <h2 class="text-lg font-medium text-charcoal mb-4">{{ $t('account.basicInfo.title') }}</h2>
            <form @submit.prevent="updateProfile" class="space-y-4">
              <div>
                <label class="block text-sm text-stone mb-1">{{ $t('account.basicInfo.email') }}</label>
                <input
                  v-model="account.email"
                  type="email"
                  disabled
                  class="input-field bg-sakura/30 cursor-not-allowed"
                />
              </div>
              <div>
                <label class="block text-sm text-stone mb-1">{{ $t('account.basicInfo.name') }}</label>
                <input
                  v-model="form.name"
                  type="text"
                  class="input-field"
                  :placeholder="$t('account.basicInfo.namePlaceholder')"
                />
              </div>
              <div>
                <label class="block text-sm text-stone mb-1">{{ $t('account.basicInfo.company') }}</label>
                <input
                  v-model="form.company"
                  type="text"
                  class="input-field"
                  :placeholder="$t('account.basicInfo.companyPlaceholder')"
                />
              </div>
              <button
                type="submit"
                :disabled="updating"
                class="btn-primary"
              >
                {{ updating ? $t('account.basicInfo.saving') : $t('account.basicInfo.save') }}
              </button>
            </form>
          </div>

          <div class="bg-white rounded-sm border border-sakura p-6">
            <h2 class="text-lg font-medium text-charcoal mb-4">{{ $t('account.phone.title') }}</h2>
            <div class="flex items-center gap-4">
              <div class="flex-1">
                <input
                  v-model="phoneForm.phone"
                  type="tel"
                  class="input-field"
                  :placeholder="$t('account.phone.placeholder')"
                />
              </div>
              <button
                @click="updatePhone"
                :disabled="updatingPhone || !phoneForm.phone"
                class="btn-soft"
              >
                {{ account.phone ? $t('account.phone.change') : $t('account.phone.bind') }}
              </button>
            </div>
            <p v-if="account.phone" class="text-sm text-stone mt-2">
              {{ $t('account.phone.current', { phone: account.phone }) }}
              <span v-if="account.phone_verified" class="text-matcha">{{ $t('account.phone.verified') }}</span>
            </p>
          </div>

          <div class="bg-white rounded-sm border border-sakura p-6">
            <h2 class="text-lg font-medium text-charcoal mb-4">{{ $t('account.password.title') }}</h2>
            <form @submit.prevent="updatePassword" class="space-y-4">
              <div>
                <label class="block text-sm text-stone mb-1">{{ $t('account.password.current') }}</label>
                <input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  class="input-field"
                  :placeholder="$t('account.password.currentPlaceholder')"
                />
              </div>
              <div>
                <label class="block text-sm text-stone mb-1">{{ $t('account.password.new') }}</label>
                <input
                  v-model="passwordForm.newPassword"
                  type="password"
                  class="input-field"
                  :placeholder="$t('account.password.newPlaceholder')"
                />
              </div>
              <div>
                <label class="block text-sm text-stone mb-1">{{ $t('account.password.confirm') }}</label>
                <input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  class="input-field"
                  :placeholder="$t('account.password.confirmPlaceholder')"
                />
              </div>
              <button
                type="submit"
                :disabled="updatingPassword"
                class="btn-primary"
              >
                {{ updatingPassword ? $t('account.password.submitting') : $t('account.password.submit') }}
              </button>
            </form>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-gradient-to-br from-indigo to-charcoal rounded-sm p-6 text-white">
            <p class="text-sm opacity-80 mb-1">{{ $t('account.tokenBalance') }}</p>
            <p class="text-3xl font-medium">{{ formatNumber(account.tokenBalance) }}</p>
            <NuxtLink to="/services" class="inline-block mt-4 text-sm underline hover:no-underline">
              {{ $t('account.recharge') }}
            </NuxtLink>
          </div>

          <div class="bg-white rounded-sm border border-sakura p-6">
            <h3 class="text-lg font-medium text-charcoal mb-4">{{ $t('account.overview.title') }}</h3>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-stone">{{ $t('account.overview.status') }}</span>
                <span class="text-matcha">{{ $t('account.overview.statusNormal') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-stone">{{ $t('account.overview.emailVerified') }}</span>
                <span :class="account.email_verified ? 'text-matcha' : 'text-stone'">
                  {{ account.email_verified ? $t('account.overview.verified') : $t('account.overview.notVerified') }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-stone">{{ $t('account.overview.registeredAt') }}</span>
                <span class="text-charcoal">{{ formatDate(account.created_at) }}</span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-sm border border-sakura p-6">
            <h3 class="text-lg font-medium text-charcoal mb-4">{{ $t('account.shortcuts.title') }}</h3>
            <div class="space-y-2">
              <NuxtLink to="/billing" class="block p-3 bg-sakura/30 rounded-sm hover:bg-sakura/50 transition-colors">
                <div class="flex items-center justify-between">
                  <span>{{ $t('account.shortcuts.billing') }}</span>
                  <Icon name="heroicons:chevron-right" class="w-4 h-4 text-stone" />
                </div>
              </NuxtLink>
              <NuxtLink to="/orders" class="block p-3 bg-sakura/30 rounded-sm hover:bg-sakura/50 transition-colors">
                <div class="flex items-center justify-between">
                  <span>{{ $t('account.shortcuts.orders') }}</span>
                  <Icon name="heroicons:chevron-right" class="w-4 h-4 text-stone" />
                </div>
              </NuxtLink>
            </div>
          </div>

          <div class="bg-white rounded-sm border border-sakura p-6">
            <h3 class="text-lg font-medium text-charcoal mb-4">{{ $t('account.embed.title') }}</h3>
            <p class="text-sm text-stone mb-4">{{ $t('account.embed.description') }}</p>
            <div class="bg-ink rounded-sm p-3 mb-3">
              <pre class="text-xs text-sakura/90 overflow-x-auto whitespace-pre-wrap">{{ embedCode }}</pre>
            </div>
            <button @click="copyEmbedCode" class="btn-soft text-sm w-full">
              <Icon name="heroicons:clipboard-document" class="w-4 h-4 inline mr-1" />
              {{ $t('account.embed.copyCode') }}
            </button>
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

const { t } = useI18n()

useHead({
  title: () => t('account.title')
})

interface Account {
  id: number
  email: string
  name: string | null
  phone: string | null
  phone_verified: boolean
  company: string | null
  status: string
  email_verified: boolean
  tokenBalance: number
  created_at: string
}

const auth = useAuth()
const router = useRouter()

const account = ref<Account>({
  id: 0,
  email: '',
  name: null,
  phone: null,
  phone_verified: false,
  company: null,
  status: 'active',
  email_verified: false,
  tokenBalance: 0,
  created_at: ''
})

const form = ref({
  name: '',
  company: ''
})

const phoneForm = ref({
  phone: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const updating = ref(false)
const updatingPhone = ref(false)
const updatingPassword = ref(false)

const embedCode = computed(() => {
  const baseUrl = window.location.origin
  return `<script src="${baseUrl}/embed.js"><\/script>
<script>
  window.TOMYBOT_CONFIG = {
    baseUrl: '${baseUrl}',
    token: '${auth.state.value.token || ''}',
    theme: 'purple',
    position: 'bottom-right'
  };
<\/script>`
})

const copyEmbedCode = async () => {
  try {
    await navigator.clipboard.writeText(embedCode.value)
    alert(t('account.embed.copied'))
  } catch (error) {
    alert(t('account.embed.copyFailed'))
  }
}

onMounted(async () => {
  await auth.fetchUser()
  if (!auth.state.value.user) {
    router.push('/login')
    return
  }
  await loadAccount()
})

const loadAccount = async () => {
  try {
    const response = await $fetch('/api/account', {
      headers: auth.getAuthHeaders()
    })
    if (response.success) {
      account.value = response.data
      form.value.name = response.data.name || ''
      form.value.company = response.data.company || ''
      phoneForm.value.phone = response.data.phone || ''
    }
  } catch (error) {
    console.error('Failed to load account:', error)
  }
}

const updateProfile = async () => {
  updating.value = true
  try {
    await $fetch('/api/account', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
      body: form.value
    })
    account.value.name = form.value.name
    account.value.company = form.value.company
    alert(t('account.alerts.saveSuccess'))
  } catch (error: any) {
    alert(error.data?.message || t('account.alerts.saveFailed'))
  } finally {
    updating.value = false
  }
}

const updatePhone = async () => {
  if (!phoneForm.value.phone || !/^1[3-9]\d{9}$/.test(phoneForm.value.phone)) {
    alert(t('account.alerts.phoneInvalid'))
    return
  }

  updatingPhone.value = true
  try {
    await $fetch('/api/account/phone', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
      body: { phone: phoneForm.value.phone }
    })
    account.value.phone = phoneForm.value.phone
    account.value.phone_verified = true
    alert(t('account.alerts.phoneBindSuccess'))
  } catch (error: any) {
    alert(error.data?.message || t('account.alerts.phoneBindFailed'))
  } finally {
    updatingPhone.value = false
  }
}

const updatePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert(t('account.alerts.passwordMismatch'))
    return
  }

  if (passwordForm.value.newPassword.length < 8) {
    alert(t('account.alerts.passwordTooShort'))
    return
  }

  updatingPassword.value = true
  try {
    await $fetch('/api/account/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
      body: passwordForm.value
    })
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
    alert(t('account.alerts.passwordChangeSuccess'))
  } catch (error: any) {
    alert(error.data?.message || t('account.alerts.passwordChangeFailed'))
  } finally {
    updatingPassword.value = false
  }
}

const formatNumber = (num: number) => {
  return num.toLocaleString()
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}
</script>
