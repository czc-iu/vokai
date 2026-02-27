<template>
  <div class="min-h-[calc(100vh-4rem)] py-8">
    <div class="container-zen max-w-md">
      <div class="bg-white rounded-sm border border-sakura p-8 text-center">
        <div v-if="loading" class="py-12">
          <div class="w-12 h-12 mx-auto border-4 border-sakura border-t-indigo rounded-full animate-spin"></div>
          <p class="mt-4 text-stone">正在生成支付二维码...</p>
        </div>

        <div v-else-if="error" class="py-8">
          <div class="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 class="mt-4 text-lg font-medium text-charcoal">支付失败</h2>
          <p class="mt-2 text-sm text-stone">{{ error }}</p>
          <NuxtLink to="/checkout" class="btn-primary mt-6 inline-block">
            重新支付
          </NuxtLink>
        </div>

        <div v-else class="space-y-6">
          <div>
            <h2 class="text-lg font-medium text-charcoal">微信扫码支付</h2>
            <p class="text-sm text-stone mt-1">
              请使用微信扫描下方二维码完成支付
            </p>
          </div>

          <div class="bg-white p-4 border border-sakura rounded-sm inline-block">
            <canvas ref="qrcodeCanvas" class="w-48 h-48"></canvas>
          </div>

          <div class="text-sm">
            <p class="text-stone">支付金额</p>
            <p class="text-2xl font-medium text-indigo">¥{{ amount }}</p>
          </div>

          <div class="text-xs text-stone">
            支付单号：{{ paymentNo }}
          </div>

          <div v-if="checking" class="flex items-center justify-center gap-2 text-sm text-stone">
            <div class="w-4 h-4 border-2 border-sakura border-t-indigo rounded-full animate-spin"></div>
            <span>正在查询支付状态...</span>
          </div>

          <div class="flex gap-3 pt-4">
            <NuxtLink to="/orders" class="btn-outline flex-1 text-center">
              查看订单
            </NuxtLink>
            <button @click="handleCheckStatus" class="btn-primary flex-1">
              已完成支付
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import QRCode from 'qrcode'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

useHead({
  title: '微信支付 - TomyBot'
})

const route = useRoute()
const router = useRouter()
const auth = useAuth()

const paymentNo = computed(() => route.params.paymentNo as string)

const loading = ref(true)
const error = ref('')
const amount = ref(0)
const codeUrl = ref('')
const checking = ref(false)
const qrcodeCanvas = ref<HTMLCanvasElement>()

const pollInterval = ref<NodeJS.Timeout | null>(null)

onMounted(async () => {
  await createWechatOrder()
})

onUnmounted(() => {
  if (pollInterval.value) {
    clearInterval(pollInterval.value)
  }
})

const createWechatOrder = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/payments/wechat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
      body: {
        paymentNo: paymentNo.value
      }
    })

    if (response.success && response.data) {
      codeUrl.value = response.data.codeUrl
      amount.value = response.data.amount
      
      await nextTick()
      generateQRCode()
      
      startPolling()
    }
  } catch (err: any) {
    error.value = err.data?.message || '创建支付订单失败'
  } finally {
    loading.value = false
  }
}

const generateQRCode = async () => {
  if (!qrcodeCanvas.value || !codeUrl.value) return

  try {
    await QRCode.toCanvas(qrcodeCanvas.value, codeUrl.value, {
      width: 192,
      margin: 2,
      color: {
        dark: '#1a1a1a',
        light: '#ffffff'
      }
    })
  } catch (err) {
    console.error('Failed to generate QR code:', err)
  }
}

const startPolling = () => {
  pollInterval.value = setInterval(async () => {
    await checkPaymentStatus(true)
  }, 5000)
}

const handleCheckStatus = () => {
  checkPaymentStatus(false)
}

const checkPaymentStatus = async (silent = false) => {
  if (!silent) {
    checking.value = true
  }

  try {
    const response = await $fetch(`/api/payments/status/${paymentNo.value}`, {
      headers: auth.getAuthHeaders()
    })

    if (response.success && response.data) {
      if (response.data.status === 'success') {
        if (pollInterval.value) {
          clearInterval(pollInterval.value)
        }
        router.push(`/pay/result?status=success&paymentNo=${paymentNo.value}`)
      } else if (response.data.status === 'failed') {
        if (pollInterval.value) {
          clearInterval(pollInterval.value)
        }
        error.value = '支付失败，请重试'
      }
    }
  } catch (err) {
    console.error('Failed to check payment status:', err)
  } finally {
    if (!silent) {
      checking.value = false
    }
  }
}
</script>
