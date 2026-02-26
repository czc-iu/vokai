<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-xl max-w-md w-full p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-medium text-charcoal">{{ $t('knowledgeBase.upload.title') }}</h2>
        <button @click="$emit('close')" class="text-stone hover:text-charcoal">
          <Icon name="heroicons:x-mark" class="w-6 h-6" />
        </button>
      </div>

      <div
        class="border-2 border-dashed border-sakura rounded-lg p-8 text-center mb-4 transition-colors"
        :class="dragOver ? 'border-indigo bg-sakura/30' : ''"
        @dragover.prevent="dragOver = true"
        @dragleave="dragOver = false"
        @drop.prevent="handleDrop"
      >
        <Icon name="heroicons:cloud-arrow-up" class="w-12 h-12 text-indigo mx-auto mb-4" />
        <p class="text-charcoal mb-2">{{ $t('knowledgeBase.upload.dragOrClick') }}</p>
        <p class="text-stone text-sm mb-4">{{ $t('knowledgeBase.upload.supportedFormats') }}</p>
        <input
          id="file-upload-input"
          type="file"
          accept=".md"
          @change="handleFileSelect"
          class="hidden"
          multiple
        />
        <label for="file-upload-input" class="btn-soft text-sm cursor-pointer">
          {{ $t('knowledgeBase.upload.selectFile') }}
        </label>
      </div>

      <div v-if="files.length > 0" class="space-y-2 mb-4">
        <div v-for="(file, index) in files" :key="index" class="flex items-center justify-between bg-sakura/30 rounded-lg px-4 py-2">
          <div class="flex items-center gap-2">
            <Icon name="heroicons:document-text" class="w-5 h-5 text-indigo" />
            <span class="text-sm text-charcoal">{{ file.name }}</span>
          </div>
          <button @click="removeFile(index)" class="text-stone hover:text-red-500">
            <Icon name="heroicons:x-mark" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-sm text-stone mb-1">描述（可选）</label>
        <input
          v-model="description"
          type="text"
          class="input-field"
          placeholder="输入文档描述"
        />
      </div>

      <div class="flex gap-3">
        <button @click="$emit('close')" class="flex-1 btn-outline">取消</button>
        <button
          @click="uploadFiles"
          :disabled="files.length === 0 || uploading"
          class="flex-1 btn-primary disabled:opacity-50"
        >
          {{ uploading ? '上传中...' : '上传' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['close', 'uploaded'])

const auth = useAuth()
const files = ref<File[]>([])
const description = ref('')
const uploading = ref(false)
const dragOver = ref(false)

const handleDrop = (e: DragEvent) => {
  dragOver.value = false
  const droppedFiles = Array.from(e.dataTransfer?.files || [])
  const mdFiles = droppedFiles.filter(f => f.name.endsWith('.md'))
  files.value.push(...mdFiles)
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const selectedFiles = Array.from(target.files || [])
  const mdFiles = selectedFiles.filter(f => f.name.endsWith('.md'))
  files.value.push(...mdFiles)
  target.value = ''
}

const removeFile = (index: number) => {
  files.value.splice(index, 1)
}

const uploadFiles = async () => {
  if (files.value.length === 0) return

  uploading.value = true
  try {
    for (const file of files.value) {
      const content = await file.text()
      await $fetch('/api/knowledge-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
        body: {
          filename: file.name,
          content,
          description: description.value
        }
      })
    }
    emit('uploaded')
  } catch (error: any) {
    alert(error.data?.message || '上传失败')
  } finally {
    uploading.value = false
  }
}
</script>
