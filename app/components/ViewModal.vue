<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-xl max-w-4xl w-full h-[80vh] flex flex-col">
      <div class="flex items-center justify-between p-6 border-b border-sakura">
        <div>
          <h2 class="text-xl font-medium text-charcoal">{{ document.filename }}</h2>
          <p v-if="document.description" class="text-sm text-stone mt-1">{{ document.description }}</p>
        </div>
        <button @click="$emit('close')" class="text-stone hover:text-charcoal">
          <Icon name="heroicons:x-mark" class="w-6 h-6" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        <div v-if="loading" class="text-center py-12">
          <div class="w-12 h-12 border-4 border-sakura border-t-indigo rounded-full animate-spin mx-auto"></div>
        </div>
        <div v-else class="prose max-w-none" v-html="renderedContent"></div>
      </div>

      <div class="flex items-center justify-end p-6 border-t border-sakura">
        <button @click="$emit('close')" class="btn-outline">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

interface Props {
  document: any
}

const props = defineProps<Props>()
const emit = defineEmits(['close'])

const auth = useAuth()
const content = ref('')
const loading = ref(true)

const renderedContent = computed(() => {
  return marked(content.value)
})

onMounted(async () => {
  try {
    const response = await $fetch<{ success: boolean; data: { content: string } }>(`/api/knowledge-base/${props.document.id}`, {
      headers: auth.getAuthHeaders()
    })
    if (response.success && response.data) {
      content.value = response.data.content
    }
  } catch (error) {
    console.error('Failed to load document:', error)
  } finally {
    loading.value = false
  }
})
</script>
