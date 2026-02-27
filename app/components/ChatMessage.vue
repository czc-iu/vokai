<template>
  <div 
    class="chat-message group"
    :class="{ 'flex-row-reverse': isUser }"
  >
    <div
      v-if="!isUser"
      class="avatar assistant flex-shrink-0"
    >
      <div class="w-6 h-6 md:w-10 md:h-10 rounded md:rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
        <Icon name="heroicons:sparkles" class="w-3 h-3 md:w-5 md:h-5 text-white" />
      </div>
    </div>

    <div class="message-wrapper flex-1" :class="{ 'flex flex-col items-end': isUser }">
      <div class="message-bubble" :class="bubbleClass">
        <div v-if="reasoningContent" class="reasoning-block mb-2 md:mb-4">
          <button
            @click="showReasoning = !showReasoning"
            class="flex items-center gap-1 md:gap-2 text-[9px] md:text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors mb-1.5 md:mb-3 px-1.5 md:px-3 py-0.5 md:py-1.5 rounded hover:bg-purple-50"
          >
            <Icon
              :name="showReasoning ? 'heroicons:chevron-down' : 'heroicons:chevron-right'"
              class="w-2.5 h-2.5 md:w-4 md:h-4 transition-transform"
              :class="{ 'rotate-0': showReasoning, '-rotate-90': !showReasoning }"
            />
            <span>思考</span>
          </button>
          <Transition name="expand">
            <div v-if="showReasoning" class="reasoning-content text-[10px] md:text-sm text-gray-600 leading-relaxed">
              {{ reasoningContent }}
            </div>
          </Transition>
        </div>

        <div v-if="isUser" class="text-white whitespace-pre-wrap leading-relaxed text-xs md:text-base">{{ content }}</div>
        <div v-else class="prose prose-sm max-w-none text-xs md:text-base">
          <div v-if="error" class="error-message flex items-center gap-1.5 md:gap-2 text-red-600 mb-2">
            <div class="relative group">
              <Icon name="heroicons:exclamation-circle" class="w-4 h-4 md:w-5 md:h-5 text-red-500" />
              <div class="error-tooltip absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[9px] md:text-xs rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                {{ error }}
                <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <span class="text-[10px] md:text-sm font-medium">本次回答失败</span>
          </div>
          <div v-html="renderedContent"></div>
          
          <div v-if="showDebug" class="debug-info mt-4 p-3 bg-gray-100 rounded-lg text-[10px] font-mono overflow-x-auto">
            <div class="font-bold mb-2 text-gray-700">原始 Markdown:</div>
            <pre class="whitespace-pre-wrap break-words text-gray-800">{{ props.content }}</pre>
            <div class="font-bold mt-3 mb-2 text-gray-700">处理后的 Markdown:</div>
            <pre class="whitespace-pre-wrap break-words text-gray-800">{{ processedContent }}</pre>
          </div>
        </div>

        <div v-if="isStreaming && !isUser" class="typing-indicator mt-1.5 md:mt-3">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>

      <div v-if="!isUser && !isStreaming" class="message-actions mt-1 md:mt-2 flex items-center gap-1.5 md:gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div v-if="tokens && tokens > 0" class="token-info">
          <Icon name="heroicons:beaker" class="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-purple-500" />
          <span v-if="inputTokens && outputTokens" class="text-[9px] md:text-xs text-gray-500">
            {{ tokens }}
          </span>
          <span v-else class="text-[9px] md:text-xs text-gray-500">{{ tokens }}</span>
        </div>
        
        <button
          @click="copyToClipboard"
          class="action-button"
          :class="{ 'copied': copied }"
          title="复制内容"
        >
          <Icon :name="copied ? 'heroicons:check' : 'heroicons:clipboard-document'" class="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
          <span class="hidden sm:inline">{{ copied ? '已复制' : '复制' }}</span>
        </button>

        <button
          @click="shareMessage"
          class="action-button"
          title="分享回答"
        >
          <Icon name="heroicons:share" class="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
          <span class="hidden sm:inline">分享</span>
        </button>
        
        <button
          @click="showDebug = !showDebug"
          class="action-button"
          :class="{ 'bg-purple-100 text-purple-600': showDebug }"
          title="调试"
        >
          <Icon name="heroicons:code-bracket" class="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
          <span class="hidden sm:inline">调试</span>
        </button>
      </div>
    </div>

    <div
      v-if="isUser"
      class="avatar user flex-shrink-0"
    >
      <div class="w-6 h-6 md:w-10 md:h-10 rounded md:rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shadow-lg">
        <Icon name="heroicons:user" class="w-3 h-3 md:w-5 md:h-5 text-white" />
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
  error?: string
}>()

const showReasoning = ref(false)
const copied = ref(false)
const showDebug = ref(false)

const isUser = computed(() => props.role === 'user')

const bubbleClass = computed(() => ({
  'user-bubble': isUser.value,
  'assistant-bubble': !isUser.value
}))

const md: MarkdownIt = new MarkdownIt({
  html: true,
  xhtmlOut: true,
  breaks: true,
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

function normalizeLineBreaks(content: string): string {
  let result = content
  
  result = result.replace(/\r\n/g, '\n')
  
  result = result.replace(/\r/g, '\n')
  
  result = result.replace(/\n{3,}/g, '\n\n')
  
  return result
}

function processNestedCodeBlocks(content: string): string {
  const lines = content.split('\n')
  const result: string[] = []
  let i = 0
  
  while (i < lines.length) {
    const line = lines[i]
    
    if (line.trim().match(/^```(?:markdown|md)$/i)) {
      const blockLines: string[] = []
      i++
      
      while (i < lines.length) {
        const innerLine = lines[i]
        if (innerLine.trim() === '```') {
          i++
          break
        }
        
        if (innerLine.trim().match(/^```\w*$/)) {
          const innerBlockLines: string[] = [innerLine]
          const innerLang = innerLine.trim().slice(3)
          i++
          
          while (i < lines.length) {
            const nestedLine = lines[i]
            innerBlockLines.push(nestedLine)
            if (nestedLine.trim() === '```') {
              i++
              break
            }
            i++
          }
          
          blockLines.push(`┌── 代码块: ${innerLang || 'text'} ──`)
          innerBlockLines.slice(1, -1).forEach(l => blockLines.push(l))
          blockLines.push('└── 代码块结束 ──')
        } else {
          blockLines.push(innerLine)
          i++
        }
      }
      
      result.push('```text')
      result.push(...blockLines)
      result.push('```')
    } else {
      result.push(line)
      i++
    }
  }
  
  return result.join('\n')
}

function flattenNestedMarkdown(content: string): string {
  return content
}

function fixMarkdownFormat(content: string): string {
  let result = content
  
  result = flattenNestedMarkdown(result)
  
  result = processNestedCodeBlocks(result)
  
  result = result.replace(/—/g, '\n\n---\n\n')
  
  result = result.replace(/([^\n])(#{1,6} )/g, '$1\n\n$2')
  
  result = result.replace(/(\|[^\n|]{3,}?\|[^\n|]{3,}?\|)(\|[^\n|]{3,}?\|[^\n|]{3,}?\|)/g, '$1\n$2')
  result = result.replace(/(\|[^\n|]{3,}?\|[^\n|]{3,}?\|)(\|[^\n|]{3,}?\|[^\n|]{3,}?\|)/g, '$1\n$2')
  result = result.replace(/(\|[^\n|]{3,}?\|[^\n|]{3,}?\|)(\|[^\n|]{3,}?\|[^\n|]{3,}?\|)/g, '$1\n$2')
  
  result = result.replace(/(-\s[^\n]{20,}?)(-\s[^\n])/g, '$1\n$2')
  result = result.replace(/(-\s[^\n]{20,}?)(-\s[^\n])/g, '$1\n$2')
  result = result.replace(/(-\s[^\n]{20,}?)(-\s[^\n])/g, '$1\n$2')
  
  result = result.replace(/\n{3,}/g, '\n\n')
  
  return result
}

const renderedContent = computed(() => {
  const normalizedContent = normalizeLineBreaks(props.content)
  const fixedContent = fixMarkdownFormat(normalizedContent)
  return md.render(fixedContent)
})

const processedContent = computed(() => {
  const normalizedContent = normalizeLineBreaks(props.content)
  const fixedContent = fixMarkdownFormat(normalizedContent)
  return fixedContent
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
    }) as { success: boolean; data?: { shareId: string } }
    
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
  @apply flex items-start gap-1.5 md:gap-4;
}

.avatar {
  animation: fadeIn 0.3s ease-out;
}

.message-bubble {
  animation: slideIn 0.3s ease-out;
}

.user-bubble {
  @apply bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg md:rounded-2xl rounded-tr-sm px-2.5 md:px-5 py-1.5 md:py-3.5 max-w-[85%] md:max-w-[85%] shadow-lg shadow-purple-500/20;
}

.assistant-bubble {
  @apply bg-white border border-purple-100 rounded-lg md:rounded-2xl rounded-tl-sm px-2.5 md:px-5 py-1.5 md:py-3.5 w-[calc(100%-2rem)] md:w-auto md:max-w-[85%] shadow-sm;
}

.reasoning-block {
  padding: 6px 8px;
  background: linear-gradient(to right, rgba(139, 92, 246, 0.05), rgba(99, 102, 241, 0.05));
  border-radius: 6px;
  border-left: 2px solid #8B5CF6;
}

@media (min-width: 768px) {
  .reasoning-block {
    padding: 12px 16px;
    border-radius: 12px;
    border-left-width: 3px;
  }
}

.reasoning-content {
  white-space: pre-wrap;
  word-break: break-word;
  padding: 4px 6px;
  background: rgba(139, 92, 246, 0.03);
  border-radius: 4px;
}

@media (min-width: 768px) {
  .reasoning-content {
    padding: 8px 12px;
    border-radius: 8px;
  }
}

.token-info {
  @apply flex items-center gap-0.5 md:gap-1.5 px-1.5 md:px-3 py-0.5 md:py-1.5 bg-purple-50 rounded md:rounded-lg;
}

.action-button {
  @apply flex items-center gap-0.5 md:gap-1 px-1.5 md:px-3 py-0.5 md:py-1.5 text-[9px] md:text-xs text-gray-500 rounded md:rounded-lg transition-all duration-200
         hover:bg-purple-50 hover:text-purple-600;
}

.action-button.copied {
  @apply bg-green-50 text-green-600;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 2px 0;
}

@media (min-width: 768px) {
  .typing-indicator {
    gap: 6px;
    padding: 4px 0;
  }
}

.typing-indicator .dot {
  width: 4px;
  height: 4px;
  background: linear-gradient(135deg, #8B5CF6, #6366F1);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

@media (min-width: 768px) {
  .typing-indicator .dot {
    width: 6px;
    height: 6px;
  }
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

.error-tooltip {
  min-width: 200px;
  max-width: 400px;
  word-break: break-word;
}

.error-message {
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

@media (min-width: 768px) {
  .error-message {
    padding: 12px 16px;
  }
}

.prose {
  @apply text-gray-800;
  line-height: 1.7;
}

.prose :deep(p) {
  @apply mb-2 md:mb-3 leading-relaxed;
}

.prose :deep(p:last-child) {
  @apply mb-0;
}

.prose :deep(code) {
  @apply bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded text-[10px] md:text-sm font-mono;
}

.prose :deep(pre) {
  @apply bg-gray-900 text-gray-100 p-3 md:p-4 rounded-lg md:rounded-xl overflow-x-auto my-3 md:my-4 shadow-lg;
}

.prose :deep(pre code) {
  @apply bg-transparent p-0 text-[10px] md:text-sm;
}

.prose :deep(ul),
.prose :deep(ol) {
  @apply my-2 md:my-3 pl-5 md:pl-6 space-y-1 md:space-y-1.5;
}

.prose :deep(ul) {
  list-style-type: disc;
}

.prose :deep(ol) {
  list-style-type: decimal;
}

.prose :deep(li) {
  @apply mb-1 md:mb-1.5 leading-relaxed;
  @apply pl-1;
}

.prose :deep(li)::marker {
  @apply text-purple-600;
}

.prose :deep(h1),
.prose :deep(h2),
.prose :deep(h3),
.prose :deep(h4),
.prose :deep(h5),
.prose :deep(h6) {
  @apply font-bold text-gray-900 mb-2 md:mb-3 mt-4 md:mt-6 first:mt-0 leading-tight;
}

.prose :deep(h1) {
  @apply text-lg md:text-2xl pb-2 border-b border-gray-200;
}

.prose :deep(h2) {
  @apply text-base md:text-xl;
}

.prose :deep(h3) {
  @apply text-sm md:text-lg;
}

.prose :deep(h4) {
  @apply text-xs md:text-base;
}

.prose :deep(blockquote) {
  @apply border-l-4 border-purple-500 pl-3 md:pl-4 pr-3 md:pr-4 py-2 my-3 md:my-4 bg-purple-50 rounded-r-lg text-gray-700 italic;
}

.prose :deep(blockquote p) {
  @apply mb-0;
}

.prose :deep(a) {
  @apply text-purple-600 hover:text-purple-700 underline font-medium transition-colors;
}

.prose :deep(strong) {
  @apply font-bold text-gray-900;
}

.prose :deep(em) {
  @apply italic;
}

.prose :deep(hr) {
  @apply my-4 md:my-6 border-t-2 border-gray-200;
}

.prose :deep(table) {
  @apply w-full border-collapse my-3 md:my-4 text-[10px] md:text-sm shadow-sm rounded-lg overflow-hidden;
}

.prose :deep(th),
.prose :deep(td) {
  @apply border border-purple-200 px-2 md:px-4 py-1.5 md:py-2.5 text-left;
}

.prose :deep(th) {
  @apply bg-purple-100 font-semibold text-purple-900;
}

.prose :deep(tr:nth-child(even)) {
  @apply bg-purple-50/50;
}

.prose :deep(tr:hover) {
  @apply bg-purple-50;
}

.prose :deep(img) {
  @apply max-w-full h-auto rounded-lg my-3 md:my-4 shadow-md;
}

.prose :deep(br) {
  @apply mb-2;
}
</style>
