<template>
  <div class="min-h-[calc(100vh-4rem)] flex">
    <aside class="hidden md:flex w-64 bg-white border-r border-sakura flex-col">
      <div class="p-4 border-b border-sakura">
          <button
          @click="newConversation"
          class="w-full btn-primary text-sm py-2.5 flex items-center justify-center gap-2"
        >
          <Icon name="heroicons:plus" class="w-4 h-4" />
          {{ $t('chat.newConversation') }}
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-3">
        <div v-if="conversations.length === 0" class="text-center py-8">
          <Icon name="heroicons:chat-bubble-left-right" class="w-12 h-12 text-sand mx-auto mb-3" />
          <p class="text-sm text-stone">{{ $t('chat.noConversations') }}</p>
        </div>

        <div v-else class="space-y-1">
          <button
            v-for="conv in conversations"
            :key="conv.id"
            @click="loadConversation(conv.id)"
            class="w-full text-left p-3 rounded-sm hover:bg-sakura/50 transition-colors text-sm"
            :class="{ 'bg-sakura': currentConversationId === conv.id }"
          >
            <div class="truncate text-charcoal">{{ conv.title }}</div>
            <div class="text-xs text-stone mt-1">{{ formatDate(conv.updated_at) }}</div>
          </button>
        </div>
      </div>
    </aside>

    <div class="flex-1 flex flex-col">
      <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 md:p-6">
        <div v-if="messages.length === 0" class="h-full flex items-center justify-center">
          <div class="text-center">
            <div class="w-20 h-20 bg-sakura rounded-lg mx-auto mb-6 flex items-center justify-center">
              <Icon name="heroicons:sparkles" class="w-10 h-10 text-indigo" />
            </div>
            <h2 class="text-xl font-medium text-charcoal mb-2">{{ $t('chat.welcome.title') }}</h2>
            <p class="text-stone text-sm max-w-sm">
              {{ $t('chat.welcome.description') }}
            </p>
          </div>
        </div>

        <div v-else class="max-w-3xl mx-auto space-y-4">
          <ChatMessage
            v-for="msg in messages"
            :key="msg.id"
            :content="msg.content"
            :role="msg.role"
            :reasoning-content="msg.reasoningContent"
          />

          <ChatMessage
            v-if="isLoading && streamingContent"
            :content="streamingContent"
            role="assistant"
            :is-streaming="true"
            :reasoning-content="streamingReasoning"
          />

          <div v-else-if="isLoading" class="flex gap-3">
            <div class="w-8 h-8 rounded-sm bg-sakura flex-shrink-0 flex items-center justify-center">
              <Icon name="heroicons:sparkles" class="w-4 h-4 text-indigo" />
            </div>
            <div class="bg-white border border-sakura px-4 py-3 rounded-lg">
              <div class="flex gap-1">
                <span class="w-2 h-2 bg-stone rounded-full animate-bounce" style="animation-delay: 0ms;"></span>
                <span class="w-2 h-2 bg-stone rounded-full animate-bounce" style="animation-delay: 150ms;"></span>
                <span class="w-2 h-2 bg-stone rounded-full animate-bounce" style="animation-delay: 300ms;"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-sakura bg-white p-4">
        <form @submit.prevent="sendMessage" class="max-w-3xl mx-auto">
          <div class="flex items-center gap-2 mb-3">
            <button
              type="button"
              @click="enableSearch = !enableSearch"
              class="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full transition-colors"
              :class="enableSearch ? 'bg-indigo text-white' : 'bg-sakura text-charcoal hover:bg-sand'"
            >
              <Icon name="heroicons:globe-alt" class="w-3.5 h-3.5" />
              {{ $t('chat.options.webSearch') }}
            </button>
            <button
              type="button"
              @click="enableThinking = !enableThinking"
              class="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full transition-colors"
              :class="enableThinking ? 'bg-indigo text-white' : 'bg-sakura text-charcoal hover:bg-sand'"
            >
              <Icon name="heroicons:light-bulb" class="w-3.5 h-3.5" />
              {{ $t('chat.options.deepThinking') }}
            </button>
          </div>

          <div class="flex gap-3">
            <input
              v-model="inputMessage"
              type="text"
              class="input-field flex-1"
              :placeholder="$t('chat.input.placeholder')"
              :disabled="isLoading"
            />
            <button
              type="submit"
              :disabled="!inputMessage.trim() || isLoading"
              class="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="heroicons:paper-airplane" class="w-5 h-5" />
            </button>
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
const enableSearch = ref(false)
const enableThinking = ref(false)
const streamingContent = ref('')
const streamingReasoning = ref('')

onMounted(async () => {
  await auth.fetchUser()
  if (!auth.state.value.user) {
    router.push('/login')
    return
  }
  await loadConversations()
})

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
        reasoningContent: undefined
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
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  const userMessage = inputMessage.value.trim()
  inputMessage.value = ''

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
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...auth.getAuthHeaders()
      },
      body: JSON.stringify({
        message: userMessage,
        conversationId: currentConversationId.value,
        enableSearch: enableSearch.value,
        enableThinking: enableThinking.value
      })
    })

    if (!response.ok) {
      throw new Error('Request failed')
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
          } else if (event.type === 'done') {
            messages.value.push({
              id: Date.now() + 1,
              role: 'assistant',
              content: streamingContent.value || t('chat.errors.noAnswer'),
              created_at: new Date().toISOString(),
              reasoningContent: streamingReasoning.value || undefined
            })
            streamingContent.value = ''
            streamingReasoning.value = ''
            await loadConversations()
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
    messages.value.push({
      id: Date.now() + 1,
      role: 'assistant',
      content: t('chat.errors.serviceUnavailable'),
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
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
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
