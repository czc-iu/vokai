<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-xl max-w-4xl w-full h-[80vh] flex flex-col">
      <div class="flex items-center justify-between p-6 border-b border-sakura">
        <h2 class="text-xl font-medium text-charcoal">
          {{ document ? '编辑文档' : '新建文档' }}
        </h2>
        <button @click="$emit('close')" class="text-stone hover:text-charcoal">
          <Icon name="heroicons:x-mark" class="w-6 h-6" />
        </button>
      </div>

      <div class="flex-1 overflow-hidden p-6 space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-stone mb-1">文件名</label>
            <input
              v-model="form.filename"
              type="text"
              class="input-field"
              placeholder="example.md"
              :disabled="!!document"
            />
          </div>
          <div>
            <label class="block text-sm text-stone mb-1">描述</label>
            <input
              v-model="form.description"
              type="text"
              class="input-field"
              placeholder="文档描述（可选）"
            />
          </div>
        </div>

        <div class="h-[calc(100%-80px)]">
          <label class="block text-sm text-stone mb-1">内容（Markdown）</label>
          <textarea
            v-model="form.content"
            class="input-field h-full font-mono text-sm resize-none"
            placeholder="# 文档标题&#10;&#10;在这里编写您的文档内容..."
          ></textarea>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 p-6 border-t border-sakura">
        <button @click="$emit('close')" class="btn-outline">取消</button>
        <button
          @click="saveDocument"
          :disabled="!form.filename || !form.content || saving"
          class="btn-primary disabled:opacity-50"
        >
          {{ saving ? '保存中...' : '保存' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  document?: any
}

const props = defineProps<Props>()
const emit = defineEmits(['close', 'saved'])

const auth = useAuth()
const form = ref({
  filename: '',
  description: '',
  content: ''
})
const saving = ref(false)

onMounted(async () => {
  if (props.document) {
    form.value.filename = props.document.filename
    form.value.description = props.document.description || ''
    
    try {
      const response = await $fetch<{ success: boolean; data: { content: string } }>(`/api/knowledge-base/${props.document.id}`, {
        headers: auth.getAuthHeaders()
      })
      if (response.success && response.data) {
        form.value.content = response.data.content
      }
    } catch (error) {
      console.error('Failed to load document:', error)
    }
  } else {
    form.value.filename = 'untitled.md'
  }
})

const saveDocument = async () => {
  if (!form.value.filename || !form.value.content) return

  if (!form.value.filename.endsWith('.md')) {
    form.value.filename += '.md'
  }

  saving.value = true
  try {
    if (props.document) {
      await $fetch(`/api/knowledge-base/${props.document.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
        body: form.value
      })
    } else {
      await $fetch('/api/knowledge-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
        body: form.value
      })
    }
    emit('saved')
  } catch (error: any) {
    alert(error.data?.message || '保存失败')
  } finally {
    saving.value = false
  }
}
</script>
