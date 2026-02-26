<template>
  <div class="min-h-[calc(100vh-4rem)] py-8">
    <div class="container-zen">
      <h1 class="text-2xl font-medium text-charcoal mb-2">{{ $t('services.heading') }}</h1>
      <p class="text-stone mb-8">{{ $t('services.description') }}</p>

      <!-- 服务套餐 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          v-for="service in services"
          :key="service.id"
          class="bg-white rounded-sm border relative overflow-hidden"
          :class="service.is_popular ? 'border-indigo ring-2 ring-indigo/20' : 'border-sakura'"
        >
          <div
            v-if="service.is_popular"
            class="absolute top-0 right-0 bg-indigo text-white text-xs px-3 py-1"
          >
            {{ $t('services.popular') }}
          </div>
          <div class="p-6">
            <h3 class="text-lg font-medium text-charcoal mb-2">{{ service.name }}</h3>
            <p class="text-stone text-sm mb-4">{{ service.description }}</p>
            <div class="mb-4">
              <span class="text-3xl font-medium text-charcoal">¥{{ service.price }}</span>
              <span v-if="service.original_price" class="text-stone line-through text-sm ml-2">
                ¥{{ service.original_price }}
              </span>
            </div>
            <div class="text-2xl font-medium text-indigo mb-4">
              {{ formatNumber(service.tokens) }}
              <span class="text-sm font-normal text-stone">{{ $t('services.tokens') }}</span>
            </div>
            <div v-if="service.validity_days" class="text-sm text-stone mb-4">
              {{ $t('services.validity', { days: service.validity_days }) }}
            </div>
            <div v-else class="text-sm text-matcha mb-4">
              {{ $t('services.permanent') }}
            </div>

            <ul v-if="service.features" class="space-y-2 mb-6">
              <li
                v-for="(feature, idx) in service.features"
                :key="idx"
                class="flex items-center gap-2 text-sm text-charcoal"
              >
                <Icon name="heroicons:check" class="w-4 h-4 text-matcha" />
                {{ feature }}
              </li>
            </ul>

            <div class="flex flex-col gap-2">
              <button
                @click="buyNow(service)"
                class="w-full btn-primary text-sm py-2.5"
              >
                {{ $t('services.buyNow') }}
              </button>
              <button
                @click="addToCart(service)"
                class="w-full btn-outline text-sm py-2.5"
              >
                {{ $t('services.addToCart') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 说明 -->
      <div class="bg-white rounded-sm border border-sakura p-6">
        <h2 class="text-lg font-medium text-charcoal mb-4">{{ $t('services.info.title') }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-stone">
          <div>
            <h3 class="font-medium text-charcoal mb-2">{{ $t('services.info.whatIsToken.title') }}</h3>
            <p>{{ $t('services.info.whatIsToken.description') }}</p>
          </div>
          <div>
            <h3 class="font-medium text-charcoal mb-2">{{ $t('services.info.howToCalculate.title') }}</h3>
            <p>{{ $t('services.info.howToCalculate.description') }}</p>
          </div>
          <div>
            <h3 class="font-medium text-charcoal mb-2">{{ $t('services.info.validityRules.title') }}</h3>
            <p>{{ $t('services.info.validityRules.description') }}</p>
          </div>
          <div>
            <h3 class="font-medium text-charcoal mb-2">{{ $t('services.info.refundPolicy.title') }}</h3>
            <p>{{ $t('services.info.refundPolicy.description') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const { t } = useI18n()

useHead({
  title: () => t('services.title')
})

interface Service {
  id: number
  name: string
  description: string | null
  tokens: number
  price: number
  original_price: number | null
  validity_days: number | null
  features: string[] | null
  is_popular: boolean
}

const services = ref<Service[]>([])
const router = useRouter()
const route = useRoute()
const auth = useAuth()

const PENDING_CART_KEY = 'tomybot_pending_cart'

const savePendingCart = (serviceId: number) => {
  if (import.meta.client) {
    const pending = JSON.parse(localStorage.getItem(PENDING_CART_KEY) || '[]')
    if (!pending.includes(serviceId)) {
      pending.push(serviceId)
      localStorage.setItem(PENDING_CART_KEY, JSON.stringify(pending))
    }
  }
}

const getPendingCart = (): number[] => {
  if (import.meta.client) {
    return JSON.parse(localStorage.getItem(PENDING_CART_KEY) || '[]')
  }
  return []
}

const clearPendingCart = () => {
  if (import.meta.client) {
    localStorage.removeItem(PENDING_CART_KEY)
  }
}

onMounted(async () => {
  await loadServices()
})

const loadServices = async () => {
  try {
    const response = await $fetch('/api/services')
    if (response.success) {
      services.value = response.data
    }
  } catch (error) {
    console.error('Failed to load services:', error)
  }
}

const addToCart = async (service: Service) => {
  if (!auth.state.value.user) {
    savePendingCart(service.id)
    alert(t('services.alerts.loginRequired'))
    router.push(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }

  try {
    await $fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
      body: { serviceId: service.id, quantity: 1 }
    })
    alert(t('services.alerts.addedToCart'))
  } catch (error: any) {
    alert(error.data?.message || t('services.alerts.addFailed'))
  }
}

const buyNow = async (service: Service) => {
  if (!auth.state.value.user) {
    savePendingCart(service.id)
    alert(t('services.alerts.loginRequired'))
    router.push(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }

  try {
    const response = await $fetch('/api/orders/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
      body: {
        method: 'balance',
        items: [{ serviceId: service.id, quantity: 1 }]
      }
    })

    if (response.success) {
      alert(t('services.alerts.purchaseSuccess'))
      router.push('/billing')
    } else {
      router.push(`/checkout?serviceId=${service.id}`)
    }
  } catch (error: any) {
    if (error.data?.message?.includes('余额不足')) {
      router.push(`/checkout?serviceId=${service.id}`)
    } else {
      alert(error.data?.message || t('services.alerts.purchaseFailed'))
    }
  }
}

const formatNumber = (num: number) => {
  return num.toLocaleString()
}

watch(() => auth.state.value.user, async (user) => {
  if (user) {
    const pendingItems = getPendingCart()
    if (pendingItems.length > 0) {
      for (const serviceId of pendingItems) {
        try {
          await $fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
            body: { serviceId, quantity: 1 }
          })
        } catch (error) {
          console.error('Failed to add pending item to cart:', error)
        }
      }
      clearPendingCart()
      alert(t('services.alerts.pendingItemsAdded'))
      router.push('/cart')
    }
  }
}, { immediate: true })
</script>
