<template>
  <div class="space-y-6">
      <!-- Header Actions -->
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-lg font-medium text-charcoal">{{ $t('admin.rag.documentList') }}</h2>
          <p class="text-sm text-gray-600 mt-1">{{ $t('admin.rag.description') }}</p>
        </div>
        <button
          @click="indexDocuments"
          :disabled="isIndexing"
          class="btn-primary px-6 py-2.5 text-sm disabled:opacity-50"
        >
          <Icon v-if="isIndexing" name="heroicons:arrow-path" class="w-4 h-4 mr-2 animate-spin" />
          {{ isIndexing ? $t('admin.rag.indexing') : $t('admin.rag.indexNow') }}
        </button>
      </div>

      <!-- Index Status -->
      <div v-if="indexStatus" class="bg-indigo/5 border border-indigo/20 rounded-lg p-4">
        <div class="flex items-center gap-3">
          <Icon name="heroicons:information-circle" class="w-5 h-5 text-indigo" />
          <div>
            <p class="text-sm font-medium text-charcoal">{{ $t('admin.rag.indexStatus') }}</p>
            <p class="text-xs text-gray-600 mt-1">
              {{ $t('admin.rag.totalDocuments') }}: {{ indexStatus.stats?.numDocuments || 0 }}
              | {{ $t('admin.rag.totalVectors') }}: {{ indexStatus.stats?.numVectors || 0 }}
            </p>
          </div>
        </div>
      </div>

      <!-- Documents Table -->
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('admin.rag.table.id') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('admin.rag.table.filename') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('admin.rag.table.size') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('admin.rag.table.status') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="documents.length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                {{ $t('admin.rag.noDocuments') }}
              </td>
            </tr>
            <tr v-for="doc in documents" :key="doc.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ doc.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ doc.url?.split('/').pop() || doc.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatSize(doc.metadata?.length || 0) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  {{ $t('admin.rag.indexed') }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Info -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <Icon name="heroicons:information-circle" class="w-5 h-5 text-blue-600 mt-0.5" />
          <div class="text-sm text-blue-700">
            <p class="font-medium mb-1">{{ $t('admin.rag.info.title') }}</p>
            <p>{{ $t('admin.rag.info.description') }}</p>
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

useHead({
  title: () => t('admin.rag.title')
})

interface Document {
  id: string
  url: string
  metadata?: any
}

interface IndexStatus {
  isCreated: boolean
  stats?: {
    numDocuments: number
    numVectors: number
  }
}

const documents = ref<Document[]>([])
const indexStatus = ref<IndexStatus | null>(null)
const isIndexing = ref(false)

onMounted(async () => {
  await loadData()
})

const loadData = async () => {
  try {
    const response = await $fetch('/api/admin/rag')
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
      method: 'POST'
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

const formatSize = (length: number) => {
  if (length < 1024) return `${length} B`
  if (length < 1024 * 1024) return `${(length / 1024).toFixed(2)} KB`
  return `${(length / (1024 * 1024)).toFixed(2)} MB`
}
</script>
