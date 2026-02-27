<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-lg font-medium text-charcoal">{{ $t('admin.rag.documentList') }}</h2>
        <p class="text-sm text-gray-600 mt-1">{{ $t('admin.rag.description') }}</p>
      </div>
      <div class="flex gap-3">
        <button
          @click="openCreateModal"
          class="btn-outline px-4 py-2.5 text-sm"
        >
          <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
          {{ $t('admin.rag.newDocument') }}
        </button>
        <button
          @click="confirmReset"
          :disabled="isResetting || isIndexing"
          class="btn-outline px-4 py-2.5 text-sm text-red-600 border-red-300 hover:bg-red-50 disabled:opacity-50"
        >
          <Icon v-if="isResetting" name="heroicons:arrow-path" class="w-4 h-4 mr-2 animate-spin" />
          <Icon v-else name="heroicons:arrow-uturn-left" class="w-4 h-4 mr-2" />
          {{ $t('admin.rag.resetIndex') }}
        </button>
        <button
          @click="indexDocuments"
          :disabled="isIndexing"
          class="btn-primary px-6 py-2.5 text-sm disabled:opacity-50"
        >
          <Icon v-if="isIndexing" name="heroicons:arrow-path" class="w-4 h-4 mr-2 animate-spin" />
          {{ isIndexing ? $t('admin.rag.indexing') : $t('admin.rag.indexNow') }}
        </button>
      </div>
    </div>

    <div v-if="indexStatus" class="bg-indigo/5 border border-indigo/20 rounded-lg p-4">
      <div class="flex items-center gap-3">
        <Icon name="heroicons:information-circle" class="w-5 h-5 text-indigo" />
        <div>
          <p class="text-sm font-medium text-charcoal">{{ $t('admin.rag.indexStatus') }}</p>
          <p class="text-xs text-gray-600 mt-1">
            {{ $t('admin.rag.totalDocuments') }}: {{ indexStatus.stats?.documents || 0 }}
            | {{ $t('admin.rag.totalVectors') }}: {{ indexStatus.stats?.chunks || 0 }}
          </p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ $t('admin.rag.table.filename') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ $t('admin.rag.table.size') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ $t('admin.rag.table.modifiedAt') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ $t('admin.rag.table.status') }}
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ $t('admin.rag.table.actions') }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="documents.length === 0">
            <td colspan="5" class="px-6 py-12 text-center text-gray-500">
              {{ $t('admin.rag.noDocuments') }}
            </td>
          </tr>
          <tr v-for="doc in documents" :key="doc.path" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <Icon name="heroicons:document-text" class="w-5 h-5 text-gray-400" />
                <span class="text-sm font-medium text-charcoal">{{ doc.path }}</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatSize(doc.size) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(doc.modifiedAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                v-if="doc.isIndexed" 
                class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800"
              >
                {{ $t('admin.rag.indexed') }}
              </span>
              <span 
                v-else 
                class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600"
              >
                {{ $t('admin.rag.notIndexed') }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="viewDocument(doc.path)"
                class="text-indigo hover:text-indigo-dark mr-3"
              >
                {{ $t('common.view') }}
              </button>
              <button
                @click="editDocument(doc.path)"
                class="text-indigo hover:text-indigo-dark mr-3"
              >
                {{ $t('common.edit') }}
              </button>
              <button
                @click="confirmDelete(doc.path)"
                class="text-red-600 hover:text-red-900"
              >
                {{ $t('admin.common.delete') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-start gap-3">
        <Icon name="heroicons:information-circle" class="w-5 h-5 text-blue-600 mt-0.5" />
        <div class="text-sm text-blue-700">
          <p class="font-medium mb-1">{{ $t('admin.rag.info.title') }}</p>
          <p>{{ $t('admin.rag.info.description') }}</p>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-charcoal">
            {{ isEditing ? $t('admin.rag.editDocument') : $t('admin.rag.viewDocument') }}
          </h3>
          <div class="flex items-center gap-3">
            <span v-if="currentFile" class="text-sm text-gray-500">{{ currentFile }}</span>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <Icon name="heroicons:x-mark" class="w-5 h-5" />
            </button>
          </div>
        </div>
        <div class="flex-1 overflow-hidden p-6">
          <textarea
            v-if="isEditing"
            v-model="editContent"
            class="w-full h-full min-h-[400px] p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-indigo focus:border-indigo resize-none"
            :placeholder="$t('admin.rag.contentPlaceholder')"
          ></textarea>
          <div v-else class="prose prose-sm max-w-none h-full overflow-auto">
            <pre class="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm">{{ viewContent }}</pre>
          </div>
        </div>
        <div class="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div class="flex items-center gap-2">
            <input
              v-if="isEditing"
              v-model="reindexAfterSave"
              type="checkbox"
              id="reindex"
              class="w-4 h-4 text-indigo border-gray-300 rounded focus:ring-indigo"
            />
            <label v-if="isEditing" for="reindex" class="text-sm text-gray-600">
              {{ $t('admin.rag.reindexAfterSave') }}
            </label>
          </div>
          <div class="flex gap-3">
            <button
              type="button"
              @click="closeModal"
              class="btn-outline px-4 py-2 text-sm"
            >
              {{ $t('admin.common.cancel') }}
            </button>
            <button
              v-if="!isEditing"
              type="button"
              @click="switchToEdit"
              class="btn-primary px-4 py-2 text-sm"
            >
              {{ $t('common.edit') }}
            </button>
            <button
              v-if="isEditing"
              type="button"
              @click="saveDocument"
              :disabled="isSaving"
              class="btn-primary px-4 py-2 text-sm disabled:opacity-50"
            >
              <Icon v-if="isSaving" name="heroicons:arrow-path" class="w-4 h-4 mr-2 animate-spin" />
              {{ $t('admin.common.save') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg w-full max-w-md mx-4">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-charcoal">{{ $t('admin.rag.newDocument') }}</h3>
          <button @click="showCreateModal = false" class="text-gray-400 hover:text-gray-600">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>
        <form @submit.prevent="createDocument" class="p-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('admin.rag.form.filename') }}
              </label>
              <div class="flex items-center">
                <input
                  v-model="newFilename"
                  type="text"
                  required
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-indigo focus:border-indigo"
                  :placeholder="$t('admin.rag.form.filenamePlaceholder')"
                />
                <span class="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-500">.md</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">{{ $t('admin.rag.form.filenameHint') }}</p>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button
              type="button"
              @click="showCreateModal = false"
              class="btn-outline px-4 py-2 text-sm"
            >
              {{ $t('admin.common.cancel') }}
            </button>
            <button
              type="submit"
              :disabled="isCreating"
              class="btn-primary px-4 py-2 text-sm disabled:opacity-50"
            >
              {{ $t('admin.rag.create') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg w-full max-w-md mx-4 p-6">
        <h3 class="text-lg font-medium text-charcoal mb-4">{{ $t('admin.common.confirmDelete') }}</h3>
        <p class="text-sm text-gray-500 mb-6">
          {{ $t('admin.rag.deleteConfirm', { name: deleteTarget }) }}
        </p>
        <div class="flex justify-end gap-3">
          <button
            @click="showDeleteConfirm = false"
            class="btn-outline px-4 py-2 text-sm"
          >
            {{ $t('admin.common.cancel') }}
          </button>
          <button
            @click="deleteDocument"
            :disabled="isDeleting"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {{ $t('admin.common.delete') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showResetConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg w-full max-w-md mx-4 p-6">
        <h3 class="text-lg font-medium text-charcoal mb-4">{{ $t('admin.rag.resetIndex') }}</h3>
        <p class="text-sm text-gray-500 mb-6">
          {{ $t('admin.rag.resetIndexConfirm') }}
        </p>
        <div class="flex justify-end gap-3">
          <button
            @click="showResetConfirm = false"
            class="btn-outline px-4 py-2 text-sm"
          >
            {{ $t('admin.common.cancel') }}
          </button>
          <button
            @click="resetIndex"
            :disabled="isResetting"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {{ $t('admin.rag.resetIndex') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { t } = useI18n()
const auth = useAuth()

useHead({
  title: () => t('admin.rag.title')
})

interface Document {
  path: string
  size: number
  createdAt: string
  modifiedAt: string
  isIndexed: boolean
  chunkCount: number
}

interface IndexStatus {
  isCreated: boolean
  stats?: {
    documents: number
    chunks: number
  }
}

const documents = ref<Document[]>([])
const indexStatus = ref<IndexStatus | null>(null)
const isIndexing = ref(false)
const isResetting = ref(false)
const showModal = ref(false)
const showCreateModal = ref(false)
const showDeleteConfirm = ref(false)
const showResetConfirm = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const isCreating = ref(false)
const isDeleting = ref(false)
const currentFile = ref('')
const viewContent = ref('')
const editContent = ref('')
const reindexAfterSave = ref(true)
const newFilename = ref('')
const deleteTarget = ref('')

onMounted(async () => {
  await loadData()
})

const loadData = async () => {
  try {
    const response = await $fetch('/api/admin/rag', {
      headers: auth.getAuthHeaders()
    })
    if (response.success && response.data) {
      documents.value = response.data.documents || []
      indexStatus.value = response.data
    }
  } catch (error) {
    console.error('Failed to load RAG data:', error)
  }
}

const indexDocuments = async () => {
  isIndexing.value = true
  try {
    const response = await $fetch('/api/admin/rag', {
      method: 'POST',
      headers: auth.getAuthHeaders()
    })
    if (response.success) {
      await loadData()
      alert(t('admin.rag.indexSuccess'))
    }
  } catch (error) {
    console.error('Failed to index documents:', error)
    alert(t('admin.rag.indexFailed'))
  } finally {
    isIndexing.value = false
  }
}

const confirmReset = () => {
  showResetConfirm.value = true
}

const resetIndex = async () => {
  isResetting.value = true
  try {
    const response = await $fetch('/api/admin/rag/reset', {
      method: 'POST',
      headers: auth.getAuthHeaders()
    })
    if (response.success) {
      showResetConfirm.value = false
      await loadData()
      alert(t('admin.rag.resetSuccess'))
    }
  } catch (error) {
    console.error('Failed to reset index:', error)
    alert(t('admin.rag.resetFailed'))
  } finally {
    isResetting.value = false
  }
}

const viewDocument = async (filename: string) => {
  try {
    const response = await $fetch(`/api/admin/rag/${encodeURIComponent(filename)}`, {
      headers: auth.getAuthHeaders()
    })
    if (response.success && response.data) {
      currentFile.value = filename
      viewContent.value = response.data.content
      editContent.value = response.data.content
      isEditing.value = false
      showModal.value = true
    }
  } catch (error) {
    console.error('Failed to load document:', error)
    alert(t('admin.rag.loadFailed'))
  }
}

const editDocument = async (filename: string) => {
  await viewDocument(filename)
  isEditing.value = true
}

const switchToEdit = () => {
  isEditing.value = true
}

const closeModal = () => {
  showModal.value = false
  currentFile.value = ''
  viewContent.value = ''
  editContent.value = ''
  isEditing.value = false
}

const saveDocument = async () => {
  if (!currentFile.value) return
  
  isSaving.value = true
  try {
    const response = await $fetch(`/api/admin/rag/${encodeURIComponent(currentFile.value)}`, {
      method: 'PUT',
      headers: auth.getAuthHeaders(),
      body: {
        content: editContent.value,
        reindex: reindexAfterSave.value
      }
    })
    if (response.success) {
      await loadData()
      closeModal()
      alert(t('admin.rag.saveSuccess'))
    }
  } catch (error) {
    console.error('Failed to save document:', error)
    alert(t('admin.rag.saveFailed'))
  } finally {
    isSaving.value = false
  }
}

const openCreateModal = () => {
  newFilename.value = ''
  showCreateModal.value = true
}

const createDocument = async () => {
  if (!newFilename.value.trim()) return
  
  isCreating.value = true
  try {
    const response = await $fetch('/api/admin/rag/create', {
      method: 'POST',
      headers: auth.getAuthHeaders(),
      body: {
        filename: newFilename.value.trim()
      }
    })
    if (response.success) {
      showCreateModal.value = false
      await loadData()
      if (response.data?.filename) {
        editDocument(response.data.filename)
      }
    }
  } catch (error: any) {
    console.error('Failed to create document:', error)
    alert(error.data?.message || t('admin.rag.createFailed'))
  } finally {
    isCreating.value = false
  }
}

const confirmDelete = (filename: string) => {
  deleteTarget.value = filename
  showDeleteConfirm.value = true
}

const deleteDocument = async () => {
  if (!deleteTarget.value) return
  
  isDeleting.value = true
  try {
    await $fetch(`/api/admin/rag/${encodeURIComponent(deleteTarget.value)}`, {
      method: 'DELETE',
      headers: auth.getAuthHeaders()
    })
    showDeleteConfirm.value = false
    deleteTarget.value = ''
    await loadData()
  } catch (error) {
    console.error('Failed to delete document:', error)
    alert(t('admin.common.deleteFailed'))
  } finally {
    isDeleting.value = false
  }
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const formatDate = (date: string | Date) => {
  const d = new Date(date)
  return d.toLocaleString()
}
</script>
