<template>
  <div class="chat-page h-[calc(100vh-4rem)] flex bg-gradient-to-br from-purple-50/30 via-white to-indigo-50/20">
    <aside class="hidden md:flex w-56 lg:w-64 bg-white/80 backdrop-blur-sm border-r border-purple-100/50 flex-col shadow-sm">
      <div class="p-2 lg:p-3">
        <button
          @click="newConversation"
          class="w-full btn-primary text-xs lg:text-sm py-2 lg:py-2.5 flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/20"
        >
          <Icon name="heroicons:plus" class="w-3.5 h-3.5 lg:w-4 lg:h-4" />
          <span class="font-medium">新建对话</span>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-1.5 lg:px-2">
        <div v-if="conversations.length === 0" class="text-center py-6 lg:py-8 px-2">
          <div class="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-2 lg:mb-3 rounded-lg lg:rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
            <Icon name="heroicons:chat-bubble-left-right" class="w-5 h-5 lg:w-6 lg:h-6 text-purple-500" />
          </div>
          <p class="text-[10px] lg:text-xs text-gray-500 leading-relaxed">
            开始您的第一次对话
          </p>
        </div>

        <div v-else class="space-y-0.5">
          <div
            v-for="conv in conversations"
            :key="conv.id"
            class="conversation-item group cursor-pointer p-1.5 lg:p-2 rounded-md lg:rounded-lg transition-all duration-200"
            :class="{ 
              'bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/50': currentConversationId === conv.id,
              'hover:bg-purple-50/50': currentConversationId !== conv.id
            }"
          >
            <div class="flex items-center gap-1.5 lg:gap-2" @click="loadConversation(conv.id)">
              <div class="w-5 h-5 lg:w-6 lg:h-6 rounded bg-purple-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Icon name="heroicons:chat-bubble-left" class="w-2.5 h-2.5 lg:w-3 lg:h-3 text-purple-600" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-[10px] lg:text-xs font-medium text-gray-800 truncate leading-tight">{{ conv.title }}</div>
                <div class="text-[9px] lg:text-[10px] text-gray-400 mt-0.5">{{ formatDate(conv.updated_at) }}</div>
              </div>
            </div>
            <button
              @click.stop="deleteConversation(conv.id)"
              class="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all"
              title="删除对话"
            >
              <Icon name="heroicons:trash" class="w-3 h-3 lg:w-3.5 lg:h-3.5 text-red-500 hover:text-red-600" />
            </button>
          </div>
        </div>
      </div>

      <div class="p-2 lg:p-3 border-t border-purple-100/50 bg-gradient-to-br from-purple-50/50 to-indigo-50/30">
        <div class="bg-white rounded-lg p-2 lg:p-2.5 shadow-sm border border-purple-100/50">
          <div class="flex items-center justify-between mb-1">
            <div class="flex items-center gap-1">
              <div class="w-5 h-5 lg:w-6 lg:h-6 rounded bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                <Icon name="heroicons:beaker" class="w-2.5 h-2.5 lg:w-3 lg:h-3 text-white" />
              </div>
              <span class="text-[10px] lg:text-xs font-medium text-gray-700">Token</span>
            </div>
            <NuxtLink 
              to="/services" 
              class="text-[9px] lg:text-[10px] text-purple-600 hover:text-purple-700 flex items-center gap-0.5"
            >
              <Icon name="heroicons:plus-circle" class="w-2.5 h-2.5 lg:w-3 lg:h-3" />
              充值
            </NuxtLink>
          </div>
          
          <div class="flex items-center gap-1 mb-1">
            <span class="text-sm lg:text-base font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {{ formatNumber(tokenBalance) }}
            </span>
            <span class="text-[9px] lg:text-[10px] text-gray-400">/ {{ formatNumber(totalTokens) }}</span>
          </div>
          
          <div class="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              class="h-full transition-all duration-500 ease-out rounded-full"
              :class="tokenBalance <= 1000 ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'"
              :style="{ width: `${tokenPercentage}%` }"
            ></div>
          </div>

          <div v-if="tokenBalance <= 1000 && tokenBalance > 0" class="mt-1.5 p-1.5 bg-orange-50 border border-orange-200 rounded">
            <div class="flex items-center gap-1">
              <Icon name="heroicons:exclamation-triangle" class="w-2.5 h-2.5 text-orange-600 flex-shrink-0" />
              <p class="text-[9px] text-orange-700">余额不足，建议充值</p>
            </div>
          </div>

          <div v-if="tokenBalance <= 0" class="mt-1.5 p-1.5 bg-red-50 border border-red-200 rounded">
            <div class="flex items-center gap-1">
              <Icon name="heroicons:x-circle" class="w-2.5 h-2.5 text-red-600 flex-shrink-0" />
              <p class="text-[9px] text-red-700">余额耗尽</p>
            </div>
            <NuxtLink 
              to="/services" 
              class="inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.5 bg-red-600 text-white text-[9px] rounded hover:bg-red-700"
            >
              充值
            </NuxtLink>
          </div>
        </div>
      </div>
    </aside>

    <div class="flex-1 flex flex-col h-full">
      <div 
        ref="messagesContainer" 
        class="flex-1 overflow-y-auto px-2 md:px-8 py-3 md:py-6 scroll-smooth"
        @scroll="handleScroll"
      >
        <div v-if="messages.length === 0" class="h-full flex items-center justify-center">
          <div class="text-center max-w-lg px-4">
            <div class="relative inline-block mb-4 md:mb-8">
              <div class="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-xl md:rounded-3xl blur-2xl opacity-30 animate-pulse-slow"></div>
              <div class="relative w-12 h-12 md:w-24 md:h-24 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl md:rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30">
                <Icon name="heroicons:sparkles" class="w-6 h-6 md:w-12 md:h-12 text-white" />
              </div>
            </div>
            
            <h2 class="text-lg md:text-3xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 md:mb-4">
              {{ $t('chat.welcome.title') }}
            </h2>
            <p class="text-gray-600 text-sm md:text-lg leading-relaxed mb-4 md:mb-8">
              {{ $t('chat.welcome.description') }}
            </p>
            
            <div class="flex flex-wrap gap-1.5 md:gap-3 justify-center">
              <button
                v-for="suggestion in suggestions"
                :key="suggestion"
                @click="inputMessage = suggestion"
                class="px-2.5 md:px-4 py-1.5 md:py-2.5 bg-white border border-purple-200 rounded-lg md:rounded-xl text-[10px] md:text-sm text-gray-700 hover:border-purple-400 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              >
                {{ suggestion }}
              </button>
            </div>
          </div>
        </div>

        <div v-else class="max-w-4xl mx-auto space-y-2 md:space-y-6 pb-20 md:pb-40">
          <TransitionGroup name="message">
            <ChatMessage
              v-for="msg in messages"
              :key="msg.id"
              :content="msg.content"
              :role="msg.role"
              :reasoning-content="msg.reasoningContent"
              :tokens="msg.tokens"
              :input-tokens="msg.inputTokens"
              :output-tokens="msg.outputTokens"
              :message-id="msg.id"
              :error="msg.error"
            />
          </TransitionGroup>

          <ChatMessage
            v-if="isLoading && streamingContent"
            :content="streamingContent"
            role="assistant"
            :is-streaming="true"
            :reasoning-content="streamingReasoning"
          />

          <div v-else-if="isLoading" class="flex items-start gap-2 md:gap-4 animate-fade-in">
            <div class="w-6 h-6 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0">
              <Icon name="heroicons:sparkles" class="w-3 h-3 md:w-5 md:h-5 text-white animate-pulse" />
            </div>
            <div class="flex-1 bg-white rounded-lg md:rounded-2xl border border-purple-100 shadow-sm p-3 md:p-5">
              <div class="flex gap-1.5 md:gap-2">
                <span class="w-1.5 h-1.5 md:w-2.5 md:h-2.5 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 0ms;"></span>
                <span class="w-1.5 h-1.5 md:w-2.5 md:h-2.5 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 150ms;"></span>
                <span class="w-1.5 h-1.5 md:w-2.5 md:h-2.5 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 300ms;"></span>
              </div>
              <p class="text-[10px] md:text-sm text-gray-400 mt-1.5 md:mt-3">AI 正在思考中...</p>
            </div>
          </div>
        </div>
      </div>

      <div class="fixed bottom-0 left-0 md:left-56 lg:left-64 right-0 bg-gradient-to-t from-white via-white to-transparent pt-1.5 md:pt-6 pb-2 md:pb-4 px-2 md:px-8 z-10">
        <form @submit.prevent="sendMessage" class="max-w-4xl mx-auto">
          <div class="bg-white rounded-lg md:rounded-2xl shadow-md md:shadow-xl shadow-purple-500/10 border border-purple-100 overflow-hidden">
            <div class="flex items-center gap-1 md:gap-2 p-1.5 md:p-3 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 border-b border-purple-100/50">
              <button
                type="button"
                @click="enableSearch = !enableSearch"
                class="feature-button text-[9px] md:text-xs px-1.5 md:px-3 py-0.5 md:py-1.5"
                :class="{ 'active': enableSearch }"
              >
                <Icon name="heroicons:globe-alt" class="w-2.5 h-2.5 md:w-4 md:h-4" />
                <span class="hidden sm:inline">联网</span>
              </button>
              <button
                type="button"
                @click="enableThinking = !enableThinking"
                class="feature-button text-[9px] md:text-xs px-1.5 md:px-3 py-0.5 md:py-1.5"
                :class="{ 'active': enableThinking }"
              >
                <Icon name="heroicons:light-bulb" class="w-2.5 h-2.5 md:w-4 md:h-4" />
                <span class="hidden sm:inline">思考</span>
              </button>
            </div>

            <div class="flex items-end gap-1.5 md:gap-3 p-2 md:p-4">
              <div class="flex-1 relative">
                <textarea
                  v-model="inputMessage"
                  @keydown="handleKeydown"
                  @input="autoResize"
                  ref="textareaRef"
                  rows="1"
                  class="w-full px-2 md:px-4 py-1.5 md:py-3 text-xs md:text-base text-gray-800 placeholder-gray-400 resize-none focus:outline-none leading-relaxed"
                  :placeholder="`${$t('chat.input.placeholder')}（按 Enter 发送 · Shift + Enter 换行）`"
                  :disabled="isLoading"
                ></textarea>
              </div>
              
              <button
                type="submit"
                :disabled="!inputMessage.trim() || isLoading"
                class="send-button w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl"
                :class="{ 'active': inputMessage.trim() && !isLoading }"
              >
                <Icon name="heroicons:paper-airplane" class="w-3.5 h-3.5 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </form>
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
  title: 'AI对话 - TomyBot'
})

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  created_at: string
  reasoningContent?: string
  tokens?: number
  inputTokens?: number
  outputTokens?: number
  error?: string
}

interface Conversation {
  id: number
  title: string
  created_at: string
  updated_at: string
}

const auth = useAuth()
const notification = useNotification()

const messages = ref<Message[]>([])
const conversations = ref<Conversation[]>([])
const currentConversationId = ref<number | null>(null)
const inputMessage = ref('')
const isLoading = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const enableSearch = ref(false)
const enableThinking = ref(false)
const streamingContent = ref('')
const streamingReasoning = ref('')
const tokenBalance = ref(0)
const totalTokens = ref(0)
const lastTokens = ref(0)
const lastInputTokens = ref(0)
const lastOutputTokens = ref(0)
const showScrollButton = ref(false)
const hasShownLowBalanceWarning = ref(false)

const suggestions = [
  '介绍一下你自己',
  '帮我写一段代码',
  '解释一下量子计算',
  '推荐一些好书'
]

onMounted(async () => {
  // auth 中间件已经处理了认证，这里只需要加载数据
  await Promise.all([
    loadConversations(),
    loadTokenBalance()
  ])
})

const loadTokenBalance = async () => {
  try {
    const response = await $fetch('/api/billing/balance', {
      headers: auth.getAuthHeaders()
    })
    if (response.success && response.data) {
      tokenBalance.value = response.data.balance
      totalTokens.value = response.data.totalPurchased || 0
      
      // 余额预警
      if (tokenBalance.value <= 1000 && tokenBalance.value > 0 && !hasShownLowBalanceWarning.value) {
        hasShownLowBalanceWarning.value = true
        notification.warning(
          '余额不足提醒',
          `当前余额仅剩 ${formatNumber(tokenBalance.value)} tokens，建议尽快充值`,
          8000
        )
      } else if (tokenBalance.value <= 0 && !hasShownLowBalanceWarning.value) {
        hasShownLowBalanceWarning.value = true
        notification.error(
          '余额已耗尽',
          '请前往充值页面购买token后继续使用',
          0 // 不自动关闭
        )
      }
    }
  } catch (error) {
    console.error('Failed to load token balance:', error)
  }
}

const tokenPercentage = computed(() => {
  if (totalTokens.value === 0) return 0
  return Math.min(100, (tokenBalance.value / totalTokens.value) * 100)
})

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const loadConversations = async () => {
  try {
    const response = await $fetch('/api/chat/conversations', {
      headers: auth.getAuthHeaders()
    })
    if (response.success && response.data) {
      conversations.value = response.data
    }
  } catch (error) {
    console.error('Failed to load conversations:', error)
  }
}

const loadConversation = async (id: number) => {
  try {
    const response = await $fetch(`/api/chat/conversations/${id}`, {
      headers: auth.getAuthHeaders()
    }) as { success: boolean; data?: Message[] }
    
    if (response.success && response.data) {
      currentConversationId.value = id
      messages.value = response.data.map((m) => ({
        ...m,
        reasoningContent: undefined,
        tokens: m.tokens || 0
      }))
      scrollToBottom()
    }
  } catch (error) {
    console.error('Failed to load conversation:', error)
  }
}

const newConversation = () => {
  currentConversationId.value = null
  messages.value = []
  inputMessage.value = ''
}

const deleteConversation = async (id: number) => {
  if (!confirm('确定要删除这个对话吗？')) return
  
  try {
    await $fetch(`/api/chat/conversations/${id}`, {
      method: 'DELETE',
      headers: auth.getAuthHeaders()
    })
    
    if (currentConversationId.value === id) {
      newConversation()
    }
    
    await loadConversations()
    notification.success('删除成功', '对话已删除')
  } catch (error) {
    console.error('Failed to delete conversation:', error)
    notification.error('删除失败', '无法删除对话')
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

const autoResize = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    const lineHeight = parseInt(getComputedStyle(textareaRef.value).lineHeight)
    const maxHeight = lineHeight * 6
    const newHeight = Math.min(textareaRef.value.scrollHeight, maxHeight)
    textareaRef.value.style.height = newHeight + 'px'
  }
}

const handleScroll = () => {
  if (messagesContainer.value) {
    const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value
    showScrollButton.value = scrollTop < scrollHeight - clientHeight - 200
  }
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return
  
  if (!auth.state.value.user) {
    messages.value.push({
      id: Date.now(),
      role: 'assistant',
      content: t('chat.errors.loginRequired'),
      created_at: new Date().toISOString()
    })
    return
  }

  // 检查余额
  if (tokenBalance.value <= 0) {
    messages.value.push({
      id: Date.now(),
      role: 'assistant',
      content: `⚠️ **当前tokens余额不足**

您的token余额已耗尽，无法继续对话。

💡 **解决方案：**
- 前往 [充值页面](/services) 购买token套餐
- 选择适合您的套餐，即可继续使用AI助手

如有疑问，请联系客服支持。`,
      created_at: new Date().toISOString()
    })
    scrollToBottom()
    return
  }

  const userMessage = inputMessage.value.trim()
  inputMessage.value = ''
  
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }

  messages.value.push({
    id: Date.now(),
    role: 'user',
    content: userMessage,
    created_at: new Date().toISOString()
  })

  scrollToBottom()
  isLoading.value = true
  streamingContent.value = ''
  streamingReasoning.value = ''

  try {
    const requestBody: any = {
      message: userMessage,
      enableSearch: enableSearch.value,
      enableThinking: enableThinking.value
    }
    
    if (currentConversationId.value) {
      requestBody.conversationId = currentConversationId.value
    }
    
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...auth.getAuthHeaders()
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      let errorMessage = t('chat.errors.serviceUnavailable')
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        // Ignore JSON parsing errors
      }
      throw new Error(errorMessage)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No reader available')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.startsWith('data:')) continue

        const data = line.slice(5).trim()
        if (!data) continue

        try {
          const event = JSON.parse(data)

          if (event.type === 'conversation') {
            currentConversationId.value = event.conversationId
          } else if (event.type === 'tool_start') {
            streamingContent.value += `调用工具：${event.tools.join(', ')}\n`
          } else if (event.type === 'tool_error') {
            streamingContent.value += `工具错误: ${event.error}\n`
          } else if (event.type === 'content') {
            const content = event.content
            if (content) {
              streamingContent.value += content
              scrollToBottom()
            }
          } else if (event.type === 'reasoning') {
            streamingReasoning.value += event.content
            scrollToBottom()
          } else if (event.type === 'tokens') {
            lastTokens.value = event.totalTokens
            lastInputTokens.value = event.inputTokens
            lastOutputTokens.value = event.outputTokens
          } else if (event.type === 'done') {
            const finalContent = streamingContent.value.trim()
            
            const isEmpty = !finalContent || finalContent.trim() === ''
            const errorMessage = isEmpty ? '回答内容为空' : undefined
            
            messages.value.push({
              id: Date.now() + 1,
              role: 'assistant',
              content: isEmpty ? '抱歉，本次回答失败。' : finalContent,
              created_at: new Date().toISOString(),
              reasoningContent: streamingReasoning.value || undefined,
              tokens: lastTokens.value,
              inputTokens: lastInputTokens.value,
              outputTokens: lastOutputTokens.value,
              error: errorMessage
            })
            streamingContent.value = ''
            streamingReasoning.value = ''
            await Promise.all([
              loadConversations(),
              loadTokenBalance()
            ])
          } else if (event.type === 'error') {
            messages.value.push({
              id: Date.now() + 1,
              role: 'assistant',
              content: '抱歉，本次回答失败。',
              created_at: new Date().toISOString(),
              error: event.message || '服务暂时不可用'
            })
            streamingContent.value = ''
            streamingReasoning.value = ''
          }
        } catch {
          // Ignore parsing errors
        }
      }
    }
  } catch (error) {
    console.error('Failed to send message:', error)
    const errorMessage = error instanceof Error ? error.message : t('chat.errors.serviceUnavailable')
    messages.value.push({
      id: Date.now() + 1,
      role: 'assistant',
      content: errorMessage,
      created_at: new Date().toISOString()
    })
    streamingContent.value = ''
    streamingReasoning.value = ''
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: 'smooth'
      })
    }
  })
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return t('chat.date.today')
  } else if (days === 1) {
    return t('chat.date.yesterday')
  } else if (days < 7) {
    return t('chat.date.daysAgo', { days })
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}
</script>

<style scoped>
.chat-page {
  position: relative;
}

/* Hide footer on chat page */
.chat-page :deep(footer) {
  display: none !important;
}

.conversation-item {
  position: relative;
}

.feature-button {
  @apply flex items-center gap-1 md:gap-1.5 px-1.5 md:px-3 py-0.5 md:py-1.5 text-[9px] md:text-xs rounded md:rounded-lg transition-all duration-200
         bg-white border border-purple-200 text-gray-600
         hover:border-purple-400 hover:text-purple-600;
}

.feature-button.active {
  @apply bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-transparent
         shadow-md shadow-purple-500/20;
}

.send-button {
  @apply w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-200
         bg-gray-100 text-gray-400;
}

.send-button.active {
  @apply bg-gradient-to-r from-purple-500 to-indigo-500 text-white
         shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40
         hover:scale-105 active:scale-95;
}

.send-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

@keyframes pulse-slow {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}

.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease-out;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.message-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.2);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.4);
}
</style>
