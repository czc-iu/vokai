<template>
  <div class="embed-chat h-screen flex flex-col bg-cream">
    <header class="bg-indigo text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <Icon name="heroicons:chat-bubble-left-right" class="w-5 h-5" />
        </div>
        <div>
          <h1 class="text-sm font-medium">{{ $t('embed.title') }}</h1>
          <p class="text-xs text-white/70">{{ $t('embed.status.online') }}</p>
        </div>
      </div>
      <button @click="closeWidget" class="p-1 hover:bg-white/10 rounded transition-colors">
        <Icon name="heroicons:x-mark" class="w-5 h-5" />
      </button>
    </header>

    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
      <div v-if="messages.length === 0" class="text-center py-12">
        <div class="w-16 h-16 bg-sakura rounded-full mx-auto mb-4 flex items-center justify-center">
          <Icon name="heroicons:chat-bubble-left-right" class="w-8 h-8 text-indigo" />
        </div>
        <p class="text-stone text-sm">{{ $t('embed.welcome.greeting') }}</p>
        <p class="text-stone text-xs mt-1">{{ $t('embed.welcome.help') }}</p>
      </div>

      <div
        v-for="(message, index) in messages"
        :key="index"
        class="flex"
        :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[80%] rounded-lg px-4 py-2.5"
          :class="message.role === 'user' ? 'bg-indigo text-white' : 'bg-white border border-sakura'"
        >
          <div v-if="message.role === 'assistant'" class="prose prose-sm">
            <ChatMessage :content="message.content" :role="message.role" />
          </div>
          <p v-else class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-start">
        <div class="bg-white border border-sakura rounded-lg px-4 py-3">
          <div class="flex gap-1">
            <div class="w-2 h-2 bg-indigo rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-indigo rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-indigo rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t border-sakura bg-white p-4 flex-shrink-0">
      <div class="flex gap-2">
        <input
          v-model="inputMessage"
          @keyup.enter="sendMessage"
          type="text"
          :placeholder="$t('embed.input.placeholder')"
          class="flex-1 input-field text-sm"
          :disabled="isLoading"
        />
        <button
          @click="sendMessage"
          :disabled="!inputMessage.trim() || isLoading"
          class="bg-indigo text-white px-4 py-2.5 rounded-lg hover:bg-indigo-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon name="heroicons:paper-airplane" class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const { t } = useI18n()
const route = useRoute()
const token = computed(() => route.query.token as string || '')
const messages = ref<Message[]>([])
const inputMessage = ref('')
const isLoading = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  const userMessage = inputMessage.value.trim()
  messages.value.push({ role: 'user', content: userMessage })
  inputMessage.value = ''
  isLoading.value = true
  scrollToBottom()

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (token.value) {
      headers['Authorization'] = `Bearer ${token.value}`
    }

    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers,
      body: JSON.stringify({ message: userMessage })
    })

    if (!response.ok) {
      throw new Error('Failed to send message')
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let assistantMessage = ''
    messages.value.push({ role: 'assistant', content: '' })
    const messageIndex = messages.value.length - 1

    while (reader) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              assistantMessage += parsed.content
              messages.value[messageIndex].content = assistantMessage
              scrollToBottom()
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      }
    }
  } catch (error) {
    console.error('Chat error:', error)
    messages.value.push({
      role: 'assistant',
      content: t('embed.error')
    })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

const closeWidget = () => {
  window.parent.postMessage('tomybot-close', '*')
}

onMounted(() => {
  scrollToBottom()
})
</script>
