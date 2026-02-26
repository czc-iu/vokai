<template>
  <div class="min-h-[calc(100vh-4rem)] section-padding">
    <div class="container-zen">
      <div class="max-w-2xl mx-auto">
        <div class="text-center mb-12">
          <span class="inline-block text-xs text-stone tracking-widest uppercase mb-4">{{ $t('home.contact.subtitle') }}</span>
          <h1 class="text-3xl font-medium text-charcoal tracking-wide mb-4">{{ $t('contactPage.heading') }}</h1>
          <p class="text-stone">{{ $t('contactPage.description') }}</p>
        </div>

        <div class="grid md:grid-cols-3 gap-6 mb-12">
          <div class="card-zen p-6 text-center">
            <div class="w-12 h-12 bg-sakura rounded-sm mx-auto mb-4 flex items-center justify-center">
              <Icon name="heroicons:envelope" class="w-6 h-6 text-indigo" />
            </div>
            <h3 class="text-sm font-medium text-charcoal mb-1">{{ $t('contactPage.info.email') }}</h3>
            <a href="mailto:info@sayco.com.cn" class="text-sm text-indigo hover:text-charcoal transition-colors">
              info@sayco.com.cn
            </a>
          </div>

          <div class="card-zen p-6 text-center">
            <div class="w-12 h-12 bg-sakura rounded-sm mx-auto mb-4 flex items-center justify-center">
              <Icon name="heroicons:building-office-2" class="w-6 h-6 text-indigo" />
            </div>
            <h3 class="text-sm font-medium text-charcoal mb-1">{{ $t('contactPage.info.company') }}</h3>
            <p class="text-sm text-stone">{{ $t('contactPage.info.companyName') }}</p>
          </div>

          <div class="card-zen p-6 text-center">
            <div class="w-12 h-12 bg-sakura rounded-sm mx-auto mb-4 flex items-center justify-center">
              <Icon name="heroicons:clock" class="w-6 h-6 text-indigo" />
            </div>
            <h3 class="text-sm font-medium text-charcoal mb-1">{{ $t('contactPage.info.workingHours') }}</h3>
            <p class="text-sm text-stone">{{ $t('contactPage.info.workingHoursValue') }}</p>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="card-zen p-8">
          <div class="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label for="name" class="block text-sm text-charcoal mb-2">
                {{ $t('contactPage.form.name') }} <span class="text-red-500">*</span>
              </label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                class="input-field"
                :placeholder="$t('contactPage.form.namePlaceholder')"
                required
              />
            </div>

            <div>
              <label for="email" class="block text-sm text-charcoal mb-2">
                {{ $t('contactPage.form.email') }} <span class="text-red-500">*</span>
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="input-field"
                :placeholder="$t('contactPage.form.emailPlaceholder')"
                required
              />
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label for="phone" class="block text-sm text-charcoal mb-2">{{ $t('contactPage.form.phone') }}</label>
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                class="input-field"
                :placeholder="$t('contactPage.form.phonePlaceholder')"
              />
            </div>

            <div>
              <label for="company" class="block text-sm text-charcoal mb-2">{{ $t('contactPage.form.company') }}</label>
              <input
                id="company"
                v-model="form.company"
                type="text"
                class="input-field"
                :placeholder="$t('contactPage.form.companyPlaceholder')"
              />
            </div>
          </div>

          <div class="mb-6">
            <label for="subject" class="block text-sm text-charcoal mb-2">{{ $t('contactPage.form.subject') }}</label>
            <input
              id="subject"
              v-model="form.subject"
              type="text"
              class="input-field"
              :placeholder="$t('contactPage.form.subjectPlaceholder')"
            />
          </div>

          <div class="mb-6">
            <label for="message" class="block text-sm text-charcoal mb-2">
              {{ $t('contactPage.form.message') }} <span class="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              v-model="form.message"
              rows="5"
              class="input-field resize-none"
              :placeholder="$t('contactPage.form.messagePlaceholder')"
              required
            ></textarea>
          </div>

          <div v-if="success" class="mb-6 p-4 bg-green-50 border border-green-100 rounded-sm">
            <p class="text-sm text-green-700 flex items-center gap-2">
              <Icon name="heroicons:check-circle" class="w-5 h-5" />
              {{ success }}
            </p>
          </div>

          <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-100 rounded-sm">
            <p class="text-sm text-red-600 flex items-center gap-2">
              <Icon name="heroicons:exclamation-circle" class="w-5 h-5" />
              {{ error }}
            </p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Icon v-if="loading" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
            <span>{{ loading ? $t('contactPage.form.submitting') : $t('contactPage.form.submit') }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'default'
})

useHead({
  title: t('contactPage.title')
})

const form = reactive({
  name: '',
  email: '',
  phone: '',
  company: '',
  subject: '',
  message: ''
})

const loading = ref(false)
const success = ref('')
const error = ref('')

const handleSubmit = async () => {
  if (!form.name || !form.email || !form.message) {
    error.value = t('contactPage.form.error.incomplete')
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const response = await $fetch('/api/contact', {
      method: 'POST',
      body: form
    })

    if (response.success) {
      success.value = response.message || ''
      form.name = ''
      form.email = ''
      form.phone = ''
      form.company = ''
      form.subject = ''
      form.message = ''
    }
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    error.value = err.data?.message || t('contactPage.form.error.failed')
  } finally {
    loading.value = false
  }
}
</script>
