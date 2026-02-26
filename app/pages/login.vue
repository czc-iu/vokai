<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center section-padding">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-medium text-charcoal tracking-wide mb-2">{{ $t('auth.login.heading') }}</h1>
        <p class="text-stone text-sm">{{ $t('auth.login.description') }}</p>
      </div>

      <form @submit.prevent="handleLogin" class="card-zen p-8">
        <div class="space-y-5">
          <div>
            <label for="email" class="block text-sm text-charcoal mb-2">{{ $t('auth.login.email') }}</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="input-field"
              :placeholder="$t('auth.login.emailPlaceholder')"
              required
            />
          </div>

          <div>
            <label for="password" class="block text-sm text-charcoal mb-2">{{ $t('auth.login.password') }}</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="input-field"
              :placeholder="$t('auth.login.passwordPlaceholder')"
              required
            />
          </div>

          <div v-if="error" class="p-3 bg-red-50 border border-red-100 rounded-sm">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Icon v-if="loading" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
            <span>{{ loading ? $t('auth.login.submitting') : $t('auth.login.submit') }}</span>
          </button>
        </div>

        <div class="mt-6 text-center">
          <p class="text-sm text-stone">
            {{ $t('auth.login.noAccount') }}
            <NuxtLink to="/register" class="text-indigo hover:text-charcoal transition-colors">
              {{ $t('auth.login.registerLink') }}
            </NuxtLink>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'default'
})

useHead({
  title: () => t('auth.login.title')
})

const auth = useAuth()
const router = useRouter()

const form = reactive({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (!form.email || !form.password) {
    error.value = t('auth.login.error.incomplete')
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await auth.login(form.email, form.password)
    if (response.success) {
      router.push('/chat')
    } else {
      error.value = response.message || t('auth.login.error.failed')
    }
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    error.value = err.data?.message || t('auth.login.error.retry')
  } finally {
    loading.value = false
  }
}
</script>
