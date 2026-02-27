<template>
  <div 
    class="chat-message group"
    :class="{ 'flex-row-reverse': isUser }"
  >
    <div
      v-if="!isUser"
      class="avatar assistant flex-shrink-0"
    >
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
        <Icon name="heroicons:sparkles" class="w-5 h-5 text-white" />
      </div>
    </div>

    <div class="message-wrapper flex-1" :class="{ 'flex flex-col items-end': isUser }">
      <div class="message-bubble" :class="bubbleClass">
        <div v-if="reasoningContent" class="reasoning-block mb-4">
          <button
            @click="showReasoning = !showReasoning"
            class="flex items-center gap-2 text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors mb-3 px-3 py-1.5 rounded-lg hover:bg-purple-50"
          >
            <Icon
              :name="showReasoning ? 'heroicons:chevron-down' : 'heroicons:chevron-right'"
              class="w-4 h-4 transition-transform"
              :class="{ 'rotate-0': showReasoning, '-rotate-90': !showReasoning }"
            />
            <span>思考过程</span>
          </button>
          <Transition name="expand">
            <div v-if="showReasoning" class="reasoning-content text-sm text-gray-600 leading-relaxed">
              {{ reasoningContent }}
            </div>
          </Transition>
        </div>

        <div v-if="isUser" class="text-white whitespace-pre-wrap leading-relaxed">{{ content }}</div>
        <div v-else class="prose prose-sm max-w-none" v-html="renderedContent"></div>

        <div v-if="isStreaming && !isUser" class="typing-indicator mt-3">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>

      <Transition name="fade">
        <div v-if="!isUser && !isStreaming" class="message-actions mt-2 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div v-if="tokens && tokens > 0" class="token-info">
            <Icon name="heroicons:beaker" class="w-3.5 h-3.5 text-purple-500" />
            <span v-if="inputTokens && outputTokens" class="text-xs text-gray-500">
              输入 {{ inputTokens }} / 输出 {{ outputTokens }} (共 {{ tokens }})
            </span>
            <span v-else class="text-xs text-gray-500">{{ tokens }} tokens</span>
          </div>
          
          <button
            @click="copyToClipboard"
            class="action-button"
            :class="{ 'copied': copied }"
            title="复制内容"
          >
            <Icon :name="copied ? 'heroicons:check' : 'heroicons:clipboard-document'" class="w-3.5 h-3.5" />
            <span>{{ copied ? '已复制' : '复制' }}</span>
          </button>

          <button
            @click="shareMessage"
            class="action-button"
            title="分享回答"
          >
            <Icon name="heroicons:share" class="w-3.5 h-3.5" />
            <span>分享</span>
          </button>
        </div>
      </Transition>
    </div>

    <div
      v-if="isUser"
      class="avatar user flex-shrink-0"
    >
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shadow-lg">
        <Icon name="heroicons:user" class="w-5 h-5 text-white" />
      </div>
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
  tokens?: number
  inputTokens?: number
  outputTokens?: number
  messageId?: number
}>()

const showReasoning = ref(false)
const copied = ref(false)

const isUser = computed(() => props.role === 'user')

const bubbleClass = computed(() => ({
  'user-bubble': isUser.value,
  'assistant-bubble': !isUser.value
}))

const md: MarkdownIt = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight: (str: string, lang: string): string => {
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

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.content)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

const shareMessage = async () => {
  if (!props.messageId) return
  
  try {
    const response = await $fetch('/api/share', {
      method: 'POST',
      body: {
        messageId: props.messageId,
        content: props.content
      }
    })
    
    if (response.success && response.data) {
      const shareUrl = `${window.location.origin}/share/${response.data.shareId}`
      await navigator.clipboard.writeText(shareUrl)
      alert('分享链接已复制到剪贴板！')
    }
  } catch (error) {
    console.error('Failed to share:', error)
    alert('分享失败，请稍后重试')
  }
}
</script>

<style scoped>
.chat-message {
  @apply flex items-start gap-4;
}

.avatar {
  animation: fadeIn 0.3s ease-out;
}

.message-bubble {
  animation: slideIn 0.3s ease-out;
}

.user-bubble {
  @apply bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl rounded-tr-md px-5 py-3.5 max-w-[85%] shadow-lg shadow-purple-500/20;
}

.assistant-bubble {
  @apply bg-white border border-purple-100 rounded-2xl rounded-tl-md px-5 py-3.5 max-w-[85%] shadow-sm;
}

.reasoning-block {
  padding: 12px 16px;
  background: linear-gradient(to right, rgba(139, 92, 246, 0.05), rgba(99, 102, 241, 0.05));
  border-radius: 12px;
  border-left: 3px solid #8B5CF6;
}

.reasoning-content {
  white-space: pre-wrap;
  word-break: break-word;
  padding: 8px 12px;
  background: rgba(139, 92, 246, 0.03);
  border-radius: 8px;
}

.token-info {
  @apply flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 rounded-lg;
}

.action-button {
  @apply flex items-center gap-1 px-3 py-1.5 text-xs text-gray-500 rounded-lg transition-all duration-200
         hover:bg-purple-50 hover:text-purple-600;
}

.action-button.copied {
  @apply bg-green-50 text-green-600;
}

.typing-indicator {
  display: flex;
  gap: 6px;
  padding: 4px 0;
}

.typing-indicator .dot {
  width: 6px;
  height: 6px;
  background: linear-gradient(135deg, #8B5CF6, #6366F1);
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
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.prose {
  @apply text-gray-800;
}

.prose :deep(p) {
  @apply mb-3 leading-relaxed;
}

.prose :deep(p:last-child) {
  @apply mb-0;
}

.prose :deep(code) {
  @apply bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded text-sm;
}

.prose :deep(pre) {
  @apply bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto my-4;
}

.prose :deep(pre code) {
  @apply bg-transparent p-0 text-sm;
}

.prose :deep(ul),
.prose :deep(ol) {
  @apply my-3 pl-6;
}

.prose :deep(li) {
  @apply mb-2;
}

.prose :deep(h1),
.prose :deep(h2),
.prose :deep(h3),
.prose :deep(h4) {
  @apply font-semibold text-gray-900 mb-3 mt-6 first:mt-0;
}

.prose :deep(h1) {
  @apply text-xl;
}

.prose :deep(h2) {
  @apply text-lg;
}

.prose :deep(h3) {
  @apply text-base;
}

.prose :deep(blockquote) {
  @apply border-l-4 border-purple-500 pl-4 my-4 italic text-gray-600;
}

.prose :deep(a) {
  @apply text-purple-600 hover:text-purple-700 underline;
}

.prose :deep(table) {
  @apply w-full border-collapse my-4;
}

.prose :deep(th),
.prose :deep(td) {
  @apply border border-purple-200 px-3 py-2 text-left;
}

.prose :deep(th) {
  @apply bg-purple-50 font-semibold;
}

.prose :deep(tr:nth-child(even)) {
  @apply bg-purple-50/30;
}
</style>
