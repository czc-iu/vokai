<template>
  <div class="min-h-[calc(100vh-4rem)] py-8">
    <div class="container-zen">
      <h1 class="text-2xl font-medium text-charcoal mb-8">购物车</h1>

      <div v-if="cart.items.length === 0" class="text-center py-16">
        <Icon name="heroicons:shopping-cart" class="w-16 h-16 text-sand mx-auto mb-4" />
        <p class="text-stone mb-4">购物车是空的</p>
        <NuxtLink to="/services" class="btn-primary">
          去购买
        </NuxtLink>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 购物车列表 -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-sm border border-sakura divide-y divide-sakura">
            <div
              v-for="item in cart.items"
              :key="item.id"
              class="p-4 flex items-center gap-4"
            >
              <div class="flex-1">
                <h3 class="font-medium text-charcoal">{{ item.service?.name }}</h3>
                <p class="text-sm text-stone">
                  {{ formatNumber(item.service?.tokens || 0) }} tokens
                </p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="updateQuantity(item.id, item.quantity - 1)"
                  class="w-8 h-8 rounded-sm border border-sakura flex items-center justify-center hover:bg-sakura/30"
                >
                  <Icon name="heroicons:minus" class="w-4 h-4" />
                </button>
                <span class="w-8 text-center">{{ item.quantity }}</span>
                <button
                  @click="updateQuantity(item.id, item.quantity + 1)"
                  class="w-8 h-8 rounded-sm border border-sakura flex items-center justify-center hover:bg-sakura/30"
                >
                  <Icon name="heroicons:plus" class="w-4 h-4" />
                </button>
              </div>
              <div class="text-right w-24">
                <p class="font-medium text-charcoal">¥{{ ((item.service?.price || 0) * item.quantity).toFixed(2) }}</p>
              </div>
              <button
                @click="removeItem(item.id)"
                class="text-stone hover:text-charcoal"
              >
                <Icon name="heroicons:trash" class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <!-- 结算信息 -->
        <div>
          <div class="bg-white rounded-sm border border-sakura p-6 sticky top-24">
            <h2 class="text-lg font-medium text-charcoal mb-4">订单摘要</h2>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-stone">商品数量</span>
                <span class="text-charcoal">{{ cart.count }} 件</span>
              </div>
              <div class="flex justify-between">
                <span class="text-stone">Token 总数</span>
                <span class="text-charcoal">{{ formatNumber(cart.totalTokens) }}</span>
              </div>
              <div class="border-t border-sakura pt-3 mt-3">
                <div class="flex justify-between">
                  <span class="font-medium text-charcoal">应付金额</span>
                  <span class="text-xl font-medium text-indigo">¥{{ cart.totalAmount.toFixed(2) }}</span>
                </div>
              </div>
            </div>
            <button
              @click="checkout"
              class="btn-primary w-full mt-6"
            >
              去结算
            </button>
            <NuxtLink to="/services" class="block text-center text-sm text-stone hover:text-charcoal mt-4">
              继续购物
            </NuxtLink>
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
  title: '购物车 - TomyBot'
})

interface CartItem {
  id: number
  service_id: number
  quantity: number
  service?: {
    id: number
    name: string
    tokens: number
    price: number
  }
}

interface Cart {
  items: CartItem[]
  count: number
  totalAmount: number
  totalTokens: number
}

const auth = useAuth()
const router = useRouter()

const cart = ref<Cart>({
  items: [],
  count: 0,
  totalAmount: 0,
  totalTokens: 0
})

onMounted(async () => {
  await auth.fetchUser()
  if (!auth.state.value.user) {
    router.push('/login')
    return
  }
  await loadCart()
})

const loadCart = async () => {
  try {
    const response = await $fetch('/api/cart', {
      headers: auth.getAuthHeaders()
    })
    if (response.success && response.data) {
      cart.value = response.data
    }
  } catch (error) {
    console.error('Failed to load cart:', error)
  }
}

const updateQuantity = async (itemId: number, quantity: number) => {
  if (quantity < 1) {
    await removeItem(itemId)
    return
  }

  try {
    await $fetch(`/api/cart/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
      body: { quantity }
    })
    await loadCart()
  } catch (error) {
    console.error('Failed to update quantity:', error)
  }
}

const removeItem = async (itemId: number) => {
  try {
    await $fetch(`/api/cart/${itemId}`, {
      method: 'DELETE',
      headers: auth.getAuthHeaders()
    })
    await loadCart()
  } catch (error) {
    console.error('Failed to remove item:', error)
  }
}

const checkout = () => {
  router.push('/checkout?cart=1')
}

const formatNumber = (num: number) => {
  return num.toLocaleString()
}
</script>
