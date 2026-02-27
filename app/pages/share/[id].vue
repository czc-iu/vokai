<template>
  <div class="min-h-screen bg-cream flex flex-col">
    <header class="bg-white border-b border-sakura">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <NuxtLink to="/" class="text-xl font-bold text-charcoal">TomyBot</NuxtLink>
          <NuxtLink to="/login" class="text-sm text-indigo hover:text-charcoal transition-colors">
            开始使用
          </NuxtLink>
        </div>
      </div>
    </header>

    <main class="flex-1 flex items-start justify-center p-8">
      <div v-if="loading" class="text-center">
        <div class="w-12 h-12 border-4 border-sakura border-t-indigo rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-stone">加载中...</p>
      </div>

      <div v-else-if="error" class="text-center max-w-md">
        <Icon name="heroicons:exclamation-triangle" class="w-16 h-16 text-sand mx-auto mb-4" />
        <h2 class="text-xl font-medium text-charcoal mb-2">分享内容不存在</h2>
        <p class="text-stone mb-6">{{ error }}</p>
        <NuxtLink to="/" class="btn-primary inline-block">
          返回首页
        </NuxtLink>
      </div>

      <div v-else class="w-full max-w-3xl">
        <div class="bg-white rounded-lg shadow-sm border border-sakura p-6">
          <div class="flex items-center gap-3 mb-6 pb-4 border-b border-sakura">
            <div class="w-10 h-10 rounded-full bg-indigo flex items-center justify-center">
              <Icon name="heroicons:sparkles" class="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 class="text-lg font-medium text-charcoal">TomyBot AI 回答</h1>
              <p class="text-xs text-stone">{{ formatDate(createdAt) }}</p>
            </div>
          </div>

          <div class="prose prose-sm max-w-none" v-html="renderedContent"></div>

          <div class="mt-6 pt-4 border-t border-sakura flex items-center justify-between">
            <div class="text-xs text-stone">
              <Icon name="heroicons:eye" class="w-4 h-4 inline mr-1" />
              {{ viewCount }} 次查看
            </div>
            <div class="flex gap-2">
              <button
                @click="copyContent"
                class="text-xs text-indigo hover:text-charcoal flex items-center gap-1 transition-colors"
              >
                <Icon :name="copied ? 'heroicons:check' : 'heroicons:clipboard-document'" class="w-4 h-4" />
                {{ copied ? '已复制' : '复制内容' }}
              </button>
            </div>
          </div>
        </div>

        <div class="mt-6 text-center">
          <NuxtLink to="/register" class="btn-primary inline-block">
            注册 TomyBot，体验完整功能
          </NuxtLink>
        </div>
      </div>
    </main>

    <footer class="bg-white border-t border-sakura py-4">
      <div class="max-w-4xl mx-auto px-4 text-center text-xs text-stone">
        © 2026 赛熠可信息技术（上海）有限公司 版权所有
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

const route = useRoute()
const shareId = route.params.id as string

const loading = ref(true)
const error = ref('')
const content = ref('')
const viewCount = ref(0)
const createdAt = ref<Date | null>(null)
const copied = ref(false)

const md: MarkdownIt = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight: (str: string, lang: string): string => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`
      } catch {
        // fallback
      }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  }
})

const renderedContent = computed(() => {
  return md.render(content.value)
})

const formatDate = (date: Date | null) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const copyContent = async () => {
  try {
    await navigator.clipboard.writeText(content.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

onMounted(async () => {
  try {
    const response = await $fetch(`/api/share/${shareId}`)
    if (response.success) {
      content.value = response.data.content
      viewCount.value = response.data.viewCount
      createdAt.value = new Date(response.data.createdAt)
    } else {
      error.value = response.error || '分享内容不存在'
    }
  } catch (err) {
    error.value = '加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.prose {
  @apply text-charcoal;
}

.prose :deep(pre) {
  @apply bg-sakura/30 p-4 rounded-lg overflow-x-auto my-4;
}

.prose :deep(code) {
  @apply text-charcoal text-sm;
}

.prose :deep(p) {
  @apply mb-4 leading-relaxed;
}

.prose :deep(ul), .prose :deep(ol) {
  @apply my-4 pl-6;
}

.prose :deep(li) {
  @apply mb-2;
}

.prose :deep(h1), .prose :deep(h2), .prose :deep(h3) {
  @apply font-medium text-charcoal mb-3 mt-6;
}

.prose :deep(h1) {
  @apply text-2xl;
}

.prose :deep(h2) {
  @apply text-xl;
}

.prose :deep(h3) {
  @apply text-lg;
}

.prose :deep(blockquote) {
  @apply border-l-4 border-indigo pl-4 italic text-stone my-4;
}

.prose :deep(a) {
  @apply text-indigo hover:text-charcoal underline;
}
</style>
