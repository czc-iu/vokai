<template>
  <div class="min-h-[calc(100vh-4rem)] py-8">
    <div class="container-zen max-w-2xl">
      <h1 class="text-2xl font-medium text-charcoal mb-8">订单结算</h1>

      <!-- 订单信息 -->
      <div class="bg-white rounded-sm border border-sakura p-6 mb-6">
        <h2 class="text-lg font-medium text-charcoal mb-4">订单详情</h2>
        <div class="space-y-3">
          <div v-for="item in orderItems" :key="item.serviceId" class="flex justify-between text-sm">
            <span class="text-charcoal">{{ item.serviceName }} × {{ item.quantity }}</span>
            <span class="text-charcoal">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
          <div class="border-t border-sakura pt-3 mt-3">
            <div class="flex justify-between">
              <span class="text-stone">Token 总数</span>
              <span class="text-charcoal">{{ formatNumber(totalTokens) }}</span>
            </div>
          </div>
          <div class="flex justify-between text-lg font-medium">
            <span class="text-charcoal">应付金额</span>
            <span class="text-indigo">¥{{ totalAmount.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- 支付方式 -->
      <div class="bg-white rounded-sm border border-sakura p-6 mb-6">
        <h2 class="text-lg font-medium text-charcoal mb-4">支付方式</h2>
        <div class="space-y-3">
          <label
            class="flex items-center gap-3 p-4 border rounded-sm cursor-pointer"
            :class="paymentMethod === 'alipay' ? 'border-indigo bg-indigo/5' : 'border-sakura'"
          >
            <input
              v-model="paymentMethod"
              type="radio"
              value="alipay"
              class="w-4 h-4 text-indigo"
            />
            <div class="flex-1">
              <p class="font-medium text-charcoal">支付宝</p>
              <p class="text-sm text-stone">支持花呗、信用卡支付</p>
            </div>
            <svg class="w-6 h-6 text-[#1677FF]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.422 15.358c-3.027-1.078-5.055-1.9-5.883-2.356.583-.95 1.078-2.033 1.433-3.2h-3.4v-1.1h4.1v-.9h-4.1V6h-1.9s.005.9 0 .9h-4v.9h4v1.1H7.9v.9h6.467a11.55 11.55 0 01-.9 2.1c-1.65-.5-3.367-.8-4.467-.8-2.4 0-3.7 1.1-3.7 2.4 0 1.6 1.5 2.8 4.1 2.8 2.2 0 4.1-.9 5.6-2.5 1.9.9 5.5 2.3 7.3 3 .4-1.2.5-1.5.8-2.5h.233v.758zM9.1 16.5c-1.6 0-2.4-.6-2.4-1.4 0-.7.7-1.2 1.9-1.2 1.1 0 2.4.3 3.8.8-1.1 1.2-2.3 1.8-3.3 1.8z"/>
            </svg>
          </label>
          <label
            class="flex items-center gap-3 p-4 border rounded-sm cursor-pointer"
            :class="paymentMethod === 'wechat' ? 'border-indigo bg-indigo/5' : 'border-sakura'"
          >
            <input
              v-model="paymentMethod"
              type="radio"
              value="wechat"
              class="w-4 h-4 text-indigo"
            />
            <div class="flex-1">
              <p class="font-medium text-charcoal">微信支付</p>
              <p class="text-sm text-stone">支持微信扫码支付</p>
            </div>
            <svg class="w-6 h-6 text-[#07C160]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.139.045c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.269-.03-.407-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982z"/>
            </svg>
          </label>
          <label
            class="flex items-center gap-3 p-4 border rounded-sm cursor-pointer"
            :class="paymentMethod === 'bank_transfer' ? 'border-indigo bg-indigo/5' : 'border-sakura'"
          >
            <input
              v-model="paymentMethod"
              type="radio"
              value="bank_transfer"
              class="w-4 h-4 text-indigo"
            />
            <div class="flex-1">
              <p class="font-medium text-charcoal">银行汇款</p>
              <p class="text-sm text-stone">对公转账，需人工确认</p>
            </div>
            <svg class="w-6 h-6 text-stone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>
            </svg>
          </label>
        </div>
      </div>

      <!-- 银行汇款信息 -->
      <div v-if="paymentMethod === 'bank_transfer'" class="bg-white rounded-sm border border-sakura p-6 mb-6">
        <h2 class="text-lg font-medium text-charcoal mb-4">银行汇款信息</h2>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-stone">开户银行</span>
            <span class="text-charcoal">{{ bankInfo.bankName }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-stone">银行账号</span>
            <span class="text-charcoal font-mono">{{ bankInfo.bankAccount }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-stone">收款户名</span>
            <span class="text-charcoal">{{ bankInfo.accountName }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-stone">开户支行</span>
            <span class="text-charcoal">{{ bankInfo.branchName }}</span>
          </div>
          <div class="mt-4 p-3 bg-sakura/30 rounded-sm">
            <p class="text-xs text-stone">
              温馨提示：请转账时备注订单号，转账完成后请联系客服确认，我们将在1-2个工作日内处理。
            </p>
          </div>
        </div>
      </div>

      <!-- 提交 -->
      <div class="flex gap-4">
        <NuxtLink to="/services" class="btn-outline flex-1 text-center">
          返回
        </NuxtLink>
        <button
          @click="submitOrder"
          :disabled="submitting"
          class="btn-primary flex-1"
        >
          {{ submitting ? '处理中...' : `确认支付 ¥${totalAmount.toFixed(2)}` }}
        </button>
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
  title: '订单结算 - TomyBot'
})

interface OrderItem {
  serviceId: number
  serviceName: string
  tokens: number
  price: number
  quantity: number
}

interface BankInfo {
  bankName: string
  bankAccount: string
  accountName: string
  branchName: string
}

const auth = useAuth()
const router = useRouter()
const route = useRoute()

const orderItems = ref<OrderItem[]>([])
const totalAmount = ref(0)
const totalTokens = ref(0)
const paymentMethod = ref('alipay')
const submitting = ref(false)
const bankInfo = ref<BankInfo>({
  bankName: '',
  bankAccount: '',
  accountName: '',
  branchName: ''
})

onMounted(async () => {
  await auth.fetchUser()
  if (!auth.state.value.user) {
    router.push('/login')
    return
  }

  await Promise.all([loadOrderItems(), loadBankInfo()])
})

const loadBankInfo = async () => {
  try {
    const response = await $fetch('/api/bank-info')
    if (response.success && response.data) {
      bankInfo.value = response.data
    }
  } catch (error) {
    console.error('Failed to load bank info:', error)
  }
}

const loadOrderItems = async () => {
  const serviceId = route.query.serviceId as string
  const isCart = route.query.cart === '1'

  if (isCart) {
    try {
      const response = await $fetch('/api/cart', {
        headers: auth.getAuthHeaders()
      })
      if (response.success && response.data) {
        orderItems.value = response.data.items.map((item: any) => ({
          serviceId: item.service_id,
          serviceName: item.service?.name || '',
          tokens: item.service?.tokens || 0,
          price: item.service?.price || 0,
          quantity: item.quantity
        }))
        totalAmount.value = response.data.totalAmount
        totalTokens.value = response.data.totalTokens
      }
    } catch (error) {
      console.error('Failed to load cart:', error)
    }
  } else if (serviceId) {
    try {
      const response = await $fetch(`/api/services/${serviceId}`)
      if (response.success && response.data) {
        orderItems.value = [{
          serviceId: response.data.id,
          serviceName: response.data.name,
          tokens: response.data.tokens,
          price: Number(response.data.price),
          quantity: 1
        }]
        totalAmount.value = Number(response.data.price)
        totalTokens.value = response.data.tokens
      }
    } catch (error) {
      console.error('Failed to load service:', error)
    }
  }
}

const submitOrder = async () => {
  submitting.value = true

  try {
    const response = await $fetch('/api/orders/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
      body: {
        method: paymentMethod.value,
        items: orderItems.value.map((item) => ({
          serviceId: item.serviceId,
          quantity: item.quantity
        }))
      }
    })

    if (response.success && response.data) {
      const data = response.data as any
      if (data.success) {
        if (paymentMethod.value === 'bank_transfer') {
          alert('订单已创建！请按照银行汇款信息完成转账，我们将在收到款项后为您开通服务。')
        } else {
          alert('支付成功！')
        }
        router.push('/orders')
      } else if (paymentMethod.value === 'wechat' && data.payment?.paymentNo) {
        router.push(`/pay/wechat/${data.payment.paymentNo}`)
      } else if (data.payUrl) {
        window.location.href = data.payUrl
      } else {
        alert('请完成支付')
        router.push('/orders')
      }
    }
  } catch (error: any) {
    alert(error.data?.message || '支付失败')
  } finally {
    submitting.value = false
  }
}

const formatNumber = (num: number) => {
  return num.toLocaleString()
}
</script>
