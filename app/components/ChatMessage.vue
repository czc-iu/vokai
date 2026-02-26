<template>
  <div class="chat-message" :class="[{ 'justify-end': isUser }, messageClass]">
    <div
      v-if="!isUser"
      class="w-8 h-8 rounded-full bg-indigo flex items-center justify-center flex-shrink-0 mr-3"
    >
      <Icon name="heroicons:sparkles" class="w-4 h-4 text-white" />
    </div>

    <div class="message-bubble" :class="bubbleClass">
      <div v-if="reasoningContent" class="reasoning-block mb-3">
        <button
          @click="showReasoning = !showReasoning"
          class="flex items-center gap-2 text-xs text-stone hover:text-charcoal transition-colors mb-2"
        >
          <Icon
            :name="showReasoning ? 'heroicons:chevron-down' : 'heroicons:chevron-right'"
            class="w-4 h-4"
          />
          <span>思考过程</span>
        </button>
        <div v-if="showReasoning" class="reasoning-content text-sm text-stone italic">
          {{ reasoningContent }}
        </div>
      </div>

      <div v-if="isUser" class="text-white whitespace-pre-wrap">{{ content }}</div>
      <div v-else class="prose prose-sm max-w-none" v-html="renderedContent"></div>

      <div v-if="isStreaming && !isUser" class="typing-indicator mt-2">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </div>

    <div
      v-if="isUser"
      class="w-8 h-8 rounded-full bg-charcoal flex items-center justify-center flex-shrink-0 ml-3"
    >
      <Icon name="heroicons:user" class="w-4 h-4 text-white" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

const props = defineProps<{
  content: string
  role: 'user' | 'assistant'
  isStreaming?: boolean
  reasoningContent?: string
}>()

const showReasoning = ref(false)

const isUser = computed(() => props.role === 'user')

const messageClass = computed(() => ({
  'user-message': isUser.value,
  'assistant-message': !isUser.value
}))

const bubbleClass = computed(() => ({
  'bg-indigo text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]': isUser.value,
  'bg-white border border-sakura rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] shadow-sm': !isUser.value
}))

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight: (str: string, lang: string) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`
      } catch {
        // fallback to default
      }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  }
})

const renderedContent = computed(() => {
  return md.render(props.content)
})
</script>

<style scoped>
.chat-message {
  @apply flex items-start mb-4;
}

.typing-indicator {
  display: flex;
  gap: 4px;
}

.typing-indicator .dot {
  width: 6px;
  height: 6px;
  background-color: #9a8c7e;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.typing-indicator .dot:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator .dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.reasoning-block {
  padding: 8px 12px;
  background: #faf9f6;
  border-radius: 8px;
  border-left: 3px solid #9a8c7e;
}

.reasoning-content {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
