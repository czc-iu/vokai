<template>
  <div class="min-h-[calc(100vh-4rem)] py-8">
    <div class="container-zen max-w-md">
      <div class="bg-white rounded-sm border border-sakura p-8 text-center">
        <div v-if="status === 'success'" class="space-y-4">
          <div class="w-16 h-16 mx-auto bg-matcha/20 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-matcha" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 class="text-xl font-medium text-charcoal">支付成功</h1>
          <p class="text-stone text-sm">您的订单已支付成功，服务已开通</p>
          <div v-if="paymentNo" class="text-xs text-stone">
            支付单号：{{ paymentNo }}
          </div>
        </div>

        <div v-else-if="status === 'pending'" class="space-y-4">
          <div class="w-16 h-16 mx-auto bg-sky/20 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-sky animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 class="text-xl font-medium text-charcoal">支付处理中</h1>
          <p class="text-stone text-sm">{{ message || '请稍后查看订单状态' }}</p>
          <div v-if="paymentNo" class="text-xs text-stone">
            支付单号：{{ paymentNo }}
          </div>
        </div>

        <div v-else class="space-y-4">
          <div class="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 class="text-xl font-medium text-charcoal">支付失败</h1>
          <p class="text-stone text-sm">{{ message || '支付过程中出现错误' }}</p>
          <div v-if="paymentNo" class="text-xs text-stone">
            支付单号：{{ paymentNo }}
          </div>
        </div>

        <div class="mt-8 space-y-3">
          <NuxtLink to="/orders" class="btn-primary w-full block text-center">
            查看订单
          </NuxtLink>
          <NuxtLink to="/services" class="btn-outline w-full block text-center">
            继续购买
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

useHead({
  title: '支付结果 - TomyBot'
})

const route = useRoute()

const status = computed(() => {
  const s = route.query.status as string
  if (s === 'success' || s === 'pending' || s === 'error') {
    return s
  }
  return 'error'
})

const paymentNo = computed(() => route.query.paymentNo as string || '')
const message = computed(() => route.query.message as string || '')
</script>
