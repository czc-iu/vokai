<template>
  <div class="min-h-[calc(100vh-4rem)] py-8">
    <div class="container-zen">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-medium text-charcoal">{{ $t('knowledgeBase.heading') }}</h1>
          <p class="text-stone text-sm mt-1">{{ $t('knowledgeBase.description') }}</p>
        </div>
        <div class="flex gap-3 items-center">
          <div class="flex items-center gap-2 mr-4 px-3 py-1.5 bg-white rounded-lg border border-sakura">
            <span class="text-sm text-stone">根据知识库回答</span>
            <button
              @click="toggleRag"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
              :class="enableRag ? 'bg-matcha' : 'bg-gray-300'"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200"
                :class="enableRag ? 'translate-x-6' : 'translate-x-1'"
              />
            </button>
          </div>
          <button @click="showUploadModal = true" class="btn-primary">
            <Icon name="heroicons:cloud-arrow-up" class="w-5 h-5 inline mr-1" />
            {{ $t('knowledgeBase.uploadFile') }}
          </button>
          <button @click="createNewFile" class="btn-soft">
            <Icon name="heroicons:document-plus" class="w-5 h-5 inline mr-1" />
            {{ $t('knowledgeBase.newDocument') }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="w-12 h-12 border-4 border-sakura border-t-indigo rounded-full animate-spin mx-auto"></div>
        <p class="text-stone text-sm mt-4">{{ $t('common.loading') }}</p>
      </div>

      <div v-else-if="documents.length === 0" class="bg-white rounded-lg border border-sakura p-12 text-center">
        <div class="w-16 h-16 bg-sakura rounded-full mx-auto mb-4 flex items-center justify-center">
          <Icon name="heroicons:document-text" class="w-8 h-8 text-indigo" />
        </div>
        <h3 class="text-lg font-medium text-charcoal mb-2">{{ $t('knowledgeBase.empty.title') }}</h3>
        <p class="text-stone text-sm mb-6">{{ $t('knowledgeBase.empty.description') }}</p>
        <button @click="showUploadModal = true" class="btn-primary">
          {{ $t('knowledgeBase.empty.uploadFirst') }}
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="doc in documents"
          :key="doc.id"
          class="bg-white rounded-lg border border-sakura p-6 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-indigo/10 rounded-lg flex items-center justify-center">
                <Icon name="heroicons:document-text" class="w-5 h-5 text-indigo" />
              </div>
              <div>
                <h3 class="font-medium text-charcoal">{{ doc.filename }}</h3>
                <p class="text-xs text-stone">{{ formatDate(doc.created_at) }}</p>
              </div>
            </div>
          </div>
          
          <p class="text-sm text-stone mb-4 line-clamp-2">{{ doc.description || $t('knowledgeBase.noDescription') }}</p>
          
          <div class="flex gap-2">
            <button @click="viewDocument(doc)" class="flex-1 btn-soft text-xs py-2">
              <Icon name="heroicons:eye" class="w-4 h-4 inline mr-1" />
              {{ $t('common.view') }}
            </button>
            <button @click="editDocument(doc)" class="flex-1 btn-soft text-xs py-2">
              <Icon name="heroicons:pencil" class="w-4 h-4 inline mr-1" />
              {{ $t('common.edit') }}
            </button>
            <button @click="deleteDocument(doc)" class="btn-outline text-xs py-2 px-3 text-red-500 border-red-300 hover:bg-red-50">
              <Icon name="heroicons:trash" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <UploadModal
      v-if="showUploadModal"
      @close="showUploadModal = false"
      @uploaded="handleUploaded"
    />

    <EditModal
      v-if="showEditModal"
      :document="currentDocument"
      @close="showEditModal = false"
      @saved="handleSaved"
    />

    <ViewModal
      v-if="showViewModal"
      :document="currentDocument"
      @close="showViewModal = false"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const { t } = useI18n()

useHead({
  title: '知识库管理 - TomyBot'
})

interface Document {
  id: number
  filename: string
  description: string | null
  created_at: string
  updated_at: string
}

const auth = useAuth()
const documents = ref<Document[]>([])
const loading = ref(true)
const showUploadModal = ref(false)
const showEditModal = ref(false)
const showViewModal = ref(false)
const currentDocument = ref<Document | null>(null)
const enableRag = ref(true)

onMounted(async () => {
  await Promise.all([
    loadDocuments(),
    loadSettings()
  ])
})

const loadSettings = async () => {
  try {
    const response = await $fetch<{ success: boolean; data: { enableRag: boolean } }>('/api/settings', {
      headers: auth.getAuthHeaders()
    })
    if (response.success && response.data) {
      enableRag.value = response.data.enableRag
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
}

const toggleRag = async () => {
  const newValue = !enableRag.value
  try {
    await $fetch('/api/settings', {
      method: 'PUT',
      headers: auth.getAuthHeaders(),
      body: { enableRag: newValue }
    })
    enableRag.value = newValue
  } catch (error) {
    console.error('Failed to update settings:', error)
  }
}

const loadDocuments = async () => {
  loading.value = true
  try {
    const response = await $fetch<{ success: boolean; data: Document[] }>('/api/knowledge-base', {
      headers: auth.getAuthHeaders()
    })
    if (response.success && response.data) {
      documents.value = response.data
    }
  } catch (error) {
    console.error('Failed to load documents:', error)
  } finally {
    loading.value = false
  }
}

const handleUploaded = () => {
  showUploadModal.value = false
  loadDocuments()
}

const handleSaved = () => {
  showEditModal.value = false
  loadDocuments()
}

const viewDocument = (doc: Document) => {
  currentDocument.value = doc
  showViewModal.value = true
}

const editDocument = (doc: Document) => {
  currentDocument.value = doc
  showEditModal.value = true
}

const createNewFile = () => {
  currentDocument.value = null
  showEditModal.value = true
}

const deleteDocument = async (doc: Document) => {
  if (!confirm(t('knowledgeBase.confirmDelete', { filename: doc.filename }))) {
    return
  }

  try {
    await $fetch(`/api/knowledge-base/${doc.id}`, {
      method: 'DELETE',
      headers: auth.getAuthHeaders()
    })
    documents.value = documents.value.filter(d => d.id !== doc.id)
  } catch (error: any) {
    alert(error.data?.message || t('knowledgeBase.alerts.deleteFailed'))
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}
</script>
