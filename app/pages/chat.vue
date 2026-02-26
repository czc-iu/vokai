<template>
  <div class="chat-page h-[calc(100vh-4rem)] flex bg-gradient-to-br from-purple-50/30 via-white to-indigo-50/20">
    <aside class="hidden md:flex w-72 bg-white/80 backdrop-blur-sm border-r border-purple-100/50 flex-col shadow-sm">
      <div class="p-5">
        <button
          @click="newConversation"
          class="w-full btn-primary text-sm py-3 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
        >
          <Icon name="heroicons:plus" class="w-5 h-5" />
          <span class="font-medium">新建对话</span>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-3">
        <div v-if="conversations.length === 0" class="text-center py-12 px-4">
          <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
            <Icon name="heroicons:chat-bubble-left-right" class="w-8 h-8 text-purple-500" />
          </div>
          <p class="text-sm text-gray-500 leading-relaxed">
            开始您的第一次对话<br>探索AI的无限可能
          </p>
        </div>

        <div v-else class="space-y-1.5">
          <div
            v-for="conv in conversations"
            :key="conv.id"
            @click="loadConversation(conv.id)"
            class="conversation-item group cursor-pointer p-3.5 rounded-xl transition-all duration-200"
            :class="{ 
              'bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/50 shadow-sm': currentConversationId === conv.id,
              'hover:bg-purple-50/50': currentConversationId !== conv.id
            }"
          >
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                <Icon name="heroicons:chat-bubble-left" class="w-4 h-4 text-purple-600" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-800 truncate">{{ conv.title }}</div>
                <div class="text-xs text-gray-400 mt-1">{{ formatDate(conv.updated_at) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="p-5 border-t border-purple-100/50 bg-gradient-to-br from-purple-50/50 to-indigo-50/30">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-purple-100/50">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                <Icon name="heroicons:beaker" class="w-4 h-4 text-white" />
              </div>
              <span class="text-sm font-medium text-gray-700">Token 余额</span>
            </div>
          </div>
          
          <div class="flex items-baseline gap-1.5 mb-3">
            <span class="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {{ formatNumber(tokenBalance) }}
            </span>
            <span class="text-sm text-gray-400">/ {{ formatNumber(totalTokens) }}</span>
          </div>
          
          <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              class="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500 ease-out rounded-full"
              :style="{ width: `${tokenPercentage}%` }"
            ></div>
          </div>
          
          <div class="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>已使用 {{ formatNumber(totalTokens - tokenBalance) }}</span>
            <span>{{ tokenPercentage.toFixed(1) }}%</span>
          </div>
        </div>
      </div>
    </aside>

    <div class="flex-1 flex flex-col h-full">
      <div 
        ref="messagesContainer" 
        class="flex-1 overflow-y-auto px-4 md:px-8 py-6 scroll-smooth"
        @scroll="handleScroll"
      >
        <div v-if="messages.length === 0" class="h-full flex items-center justify-center">
          <div class="text-center max-w-lg">
            <div class="relative inline-block mb-8">
              <div class="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-3xl blur-2xl opacity-30 animate-pulse-slow"></div>
              <div class="relative w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30">
                <Icon name="heroicons:sparkles" class="w-12 h-12 text-white" />
              </div>
            </div>
            
            <h2 class="text-3xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              {{ $t('chat.welcome.title') }}
            </h2>
            <p class="text-gray-600 text-lg leading-relaxed mb-8">
              {{ $t('chat.welcome.description') }}
            </p>
            
            <div class="flex flex-wrap gap-3 justify-center">
              <button
                v-for="suggestion in suggestions"
                :key="suggestion"
                @click="inputMessage = suggestion"
                class="px-4 py-2.5 bg-white border border-purple-200 rounded-xl text-sm text-gray-700 hover:border-purple-400 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              >
                {{ suggestion }}
              </button>
            </div>
          </div>
        </div>

        <div v-else class="max-w-4xl mx-auto space-y-6 pb-40">
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
            />
          </TransitionGroup>

          <ChatMessage
            v-if="isLoading && streamingContent"
            :content="streamingContent"
            role="assistant"
            :is-streaming="true"
            :reasoning-content="streamingReasoning"
          />

          <div v-else-if="isLoading" class="flex items-start gap-4 animate-fade-in">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0">
              <Icon name="heroicons:sparkles" class="w-5 h-5 text-white animate-pulse" />
            </div>
            <div class="flex-1 bg-white rounded-2xl border border-purple-100 shadow-sm p-5">
              <div class="flex gap-2">
                <span class="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 0ms;"></span>
                <span class="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 150ms;"></span>
                <span class="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 300ms;"></span>
              </div>
              <p class="text-sm text-gray-400 mt-3">AI 正在思考中...</p>
            </div>
          </div>
        </div>
      </div>

      <div class="fixed bottom-0 left-0 md:left-72 right-0 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-4 px-4 md:px-8 z-10">
        <form @submit.prevent="sendMessage" class="max-w-4xl mx-auto">
          <div class="bg-white rounded-2xl shadow-xl shadow-purple-500/10 border border-purple-100 overflow-hidden">
            <div class="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 border-b border-purple-100/50">
              <button
                type="button"
                @click="enableSearch = !enableSearch"
                class="feature-button"
                :class="{ 'active': enableSearch }"
              >
                <Icon name="heroicons:globe-alt" class="w-4 h-4" />
                <span>联网搜索</span>
              </button>
              <button
                type="button"
                @click="enableThinking = !enableThinking"
                class="feature-button"
                :class="{ 'active': enableThinking }"
              >
                <Icon name="heroicons:light-bulb" class="w-4 h-4" />
                <span>深度思考</span>
              </button>
            </div>

            <div class="flex items-end gap-3 p-4">
              <div class="flex-1 relative">
                <textarea
                  v-model="inputMessage"
                  @keydown="handleKeydown"
                  @input="autoResize"
                  ref="textareaRef"
                  rows="1"
                  class="w-full px-4 py-3 text-gray-800 placeholder-gray-400 resize-none focus:outline-none text-base leading-relaxed"
                  :placeholder="$t('chat.input.placeholder')"
                  :disabled="isLoading"
                  style="max-height: 200px;"
                ></textarea>
              </div>
              
              <button
                type="submit"
                :disabled="!inputMessage.trim() || isLoading"
                class="send-button"
                :class="{ 'active': inputMessage.trim() && !isLoading }"
              >
                <Icon name="heroicons:paper-airplane" class="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div class="text-center mt-3 text-xs text-gray-400">
            按 Enter 发送 · Shift + Enter 换行
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
}

interface Conversation {
  id: number
  title: string
  created_at: string
  updated_at: string
}

const auth = useAuth()
const router = useRouter()

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
    if (response.success) {
      tokenBalance.value = response.data.balance
      totalTokens.value = response.data.totalPurchased || 0
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
    if (response.success) {
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
    })
    if (response.success) {
      currentConversationId.value = id
      messages.value = response.data.map((m: Message) => ({
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

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

const autoResize = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
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
      content: '⚠️ 当前tokens余额不足，请充值后继续使用。',
      created_at: new Date().toISOString()
    })
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
          } else if (event.type === 'content') {
            streamingContent.value += event.content
            scrollToBottom()
          } else if (event.type === 'reasoning') {
            streamingReasoning.value += event.content
            scrollToBottom()
          } else if (event.type === 'tokens') {
            lastTokens.value = event.totalTokens
            lastInputTokens.value = event.inputTokens
            lastOutputTokens.value = event.outputTokens
          } else if (event.type === 'done') {
            messages.value.push({
              id: Date.now() + 1,
              role: 'assistant',
              content: streamingContent.value || t('chat.errors.noAnswer'),
              created_at: new Date().toISOString(),
              reasoningContent: streamingReasoning.value || undefined,
              tokens: lastTokens.value,
              inputTokens: lastInputTokens.value,
              outputTokens: lastOutputTokens.value
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
              content: event.message || t('chat.errors.serviceUnavailable'),
              created_at: new Date().toISOString()
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
  @apply flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all duration-200
         bg-white border border-purple-200 text-gray-600
         hover:border-purple-400 hover:text-purple-600;
}

.feature-button.active {
  @apply bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-transparent
         shadow-md shadow-purple-500/20;
}

.send-button {
  @apply w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200
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
