<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center section-padding">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-medium text-charcoal tracking-wide mb-2">{{ $t('auth.register.heading') }}</h1>
        <p class="text-stone text-sm">{{ $t('auth.register.description') }}</p>
      </div>

      <form @submit.prevent="handleRegister" class="card-zen p-8">
        <div class="space-y-5">
          <div>
            <label for="name" class="block text-sm text-charcoal mb-2">{{ $t('auth.register.name') }}</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              class="input-field"
              :placeholder="$t('auth.register.namePlaceholder')"
            />
          </div>

          <div>
            <label for="email" class="block text-sm text-charcoal mb-2">{{ $t('auth.register.email') }}</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="input-field"
              :placeholder="$t('auth.register.emailPlaceholder')"
              required
            />
          </div>

          <div>
            <label for="password" class="block text-sm text-charcoal mb-2">{{ $t('auth.register.password') }}</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="input-field"
              :placeholder="$t('auth.register.passwordPlaceholder')"
              required
              minlength="8"
            />
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm text-charcoal mb-2">{{ $t('auth.register.confirmPassword') }}</label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              class="input-field"
              :placeholder="$t('auth.register.confirmPasswordPlaceholder')"
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
            <span>{{ loading ? $t('auth.register.submitting') : $t('auth.register.submit') }}</span>
          </button>
        </div>

        <div class="mt-6 text-center">
          <p class="text-sm text-stone">
            {{ $t('auth.register.hasAccount') }}
            <NuxtLink to="/login" class="text-indigo hover:text-charcoal transition-colors">
              {{ $t('auth.register.loginLink') }}
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
  title: () => t('auth.register.title')
})

const auth = useAuth()
const router = useRouter()
const route = useRoute()

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
  if (!form.email || !form.password || !form.confirmPassword) {
    error.value = t('auth.register.error.incomplete')
    return
  }

  if (form.password.length < 8) {
    error.value = t('auth.register.error.passwordLength')
    return
  }

  if (form.password !== form.confirmPassword) {
    error.value = t('auth.register.error.passwordMismatch')
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await auth.register(form.email, form.password, form.name || undefined)
    if (response.success) {
      const redirect = route.query.redirect as string || '/chat'
      router.push(redirect)
    } else {
      error.value = response.message || t('auth.register.error.failed')
    }
  } catch (e: unknown) {
    console.error('Registration error:', e)
    const err = e as { 
      data?: { 
        message?: string,
        data?: {
          message?: string
        }
      },
      message?: string 
    }
    error.value = err.data?.message || err.data?.data?.message || err.message || t('auth.register.error.retry')
  } finally {
    loading.value = false
  }
}
</script>
