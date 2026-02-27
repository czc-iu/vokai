<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-lg font-medium text-charcoal">{{ $t('admin.skills.skillList') }}</h2>
        <p class="text-sm text-gray-600 mt-1">{{ $t('admin.skills.description') }}</p>
      </div>
      <div class="flex gap-3">
        <button
          @click="showSearchModal = true"
          class="btn-outline px-4 py-2.5 text-sm"
        >
          <Icon name="heroicons:magnifying-glass" class="w-4 h-4 mr-2" />
          {{ $t('admin.skills.searchInstall') }}
        </button>
        <button
          @click="scanSkills"
          :disabled="isScanning"
          class="btn-primary px-6 py-2.5 text-sm disabled:opacity-50"
        >
          <Icon v-if="isScanning" name="heroicons:arrow-path" class="w-4 h-4 mr-2 animate-spin" />
          {{ $t('admin.skills.scanNow') }}
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg border border-gray-200">
      <div v-if="skills.length === 0" class="p-12 text-center text-gray-500">
        {{ $t('admin.skills.noSkills') }}
      </div>
      <div v-else class="divide-y divide-gray-200">
        <div v-for="skill in skills" :key="skill.id" class="p-6 hover:bg-gray-50">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3">
                <h3 class="text-sm font-medium text-charcoal">{{ skill.name }}</h3>
                <button
                  @click="toggleSkill(skill)"
                  :class="[
                    'px-2 py-0.5 text-xs font-medium rounded-full transition-colors',
                    skill.enabled 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  ]"
                >
                  {{ skill.enabled ? $t('admin.skills.enabled') : $t('admin.skills.disabled') }}
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-1">{{ skill.path }}</p>
              <p v-if="skill.description" class="text-xs text-gray-400 mt-1">{{ skill.description }}</p>
            </div>
            <div class="flex items-center gap-3">
              <button
                @click="browseSkill(skill)"
                class="text-indigo-600 hover:text-indigo-700 text-sm"
              >
                {{ $t('admin.skills.browse') }}
              </button>
              <button
                @click="deleteSkill(skill.id)"
                class="text-red-600 hover:text-red-700 text-sm"
              >
                {{ $t('admin.common.delete') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- File Browser Modal -->
    <div v-if="showBrowseModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showBrowseModal = false">
      <div class="bg-white rounded-xl max-w-5xl w-full h-[85vh] flex flex-col">
        <div class="flex items-center justify-between p-4 border-b border-sakura">
          <div class="flex items-center gap-2">
            <h2 class="text-lg font-medium text-charcoal">
              {{ browsingSkill?.name }}
            </h2>
            <span v-if="currentPath" class="text-sm text-gray-500">/ {{ currentPath }}</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="currentPath"
              @click="goToParent"
              class="text-gray-600 hover:text-gray-800 p-1"
              :title="$t('admin.skills.parentDir')"
            >
              <Icon name="heroicons:arrow-up" class="w-5 h-5" />
            </button>
            <button
              @click="showNewFileModal = true"
              class="text-indigo-600 hover:text-indigo-700 text-sm px-2 py-1"
            >
              <Icon name="heroicons:plus" class="w-4 h-4 mr-1" />
              {{ $t('admin.skills.newFile') }}
            </button>
            <button @click="showBrowseModal = false" class="text-stone hover:text-charcoal p-1">
              <Icon name="heroicons:x-mark" class="w-6 h-6" />
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-auto p-4">
          <div v-if="isLoadingFiles" class="flex items-center justify-center py-12">
            <Icon name="heroicons:arrow-path" class="w-8 h-8 animate-spin text-gray-400" />
          </div>
          <div v-else-if="files.length === 0" class="text-center py-12 text-gray-500">
            {{ $t('admin.skills.noFiles') }}
          </div>
          <table v-else class="w-full">
            <thead>
              <tr class="text-left text-xs text-gray-500 border-b">
                <th class="pb-2 font-medium">{{ $t('admin.skills.fileName') }}</th>
                <th class="pb-2 font-medium w-24">{{ $t('admin.skills.fileSize') }}</th>
                <th class="pb-2 font-medium w-36">{{ $t('admin.skills.modifiedAt') }}</th>
                <th class="pb-2 font-medium w-24">{{ $t('admin.skills.fileActions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr 
                v-for="file in files" 
                :key="file.path" 
                class="hover:bg-gray-50 cursor-pointer"
                @click="file.type === 'directory' ? enterDirectory(file.path) : openFile(file)"
              >
                <td class="py-2.5">
                  <div class="flex items-center gap-2">
                    <Icon 
                      :name="file.type === 'directory' ? 'heroicons:folder' : getFileIcon(file.name)" 
                      :class="file.type === 'directory' ? 'text-yellow-500' : 'text-gray-400'"
                      class="w-5 h-5"
                    />
                    <span class="text-sm text-charcoal">{{ file.name }}</span>
                  </div>
                </td>
                <td class="py-2.5 text-sm text-gray-500">
                  {{ file.type === 'file' ? formatSize(file.size) : '-' }}
                </td>
                <td class="py-2.5 text-sm text-gray-500">
                  {{ formatDate(file.modifiedAt) }}
                </td>
                <td class="py-2.5">
                  <div class="flex items-center gap-2" @click.stop>
                    <button 
                      v-if="file.type === 'file'"
                      @click="openFile(file)"
                      class="text-indigo-600 hover:text-indigo-700 text-xs"
                    >
                      {{ $t('admin.skills.edit') }}
                    </button>
                    <button 
                      @click="confirmDeleteFile(file)"
                      class="text-red-600 hover:text-red-700 text-xs"
                    >
                      {{ $t('admin.common.delete') }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- File Editor Modal -->
    <div v-if="showEditorModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" @click.self="showEditorModal = false">
      <div class="bg-white rounded-xl max-w-4xl w-full h-[80vh] flex flex-col">
        <div class="flex items-center justify-between p-4 border-b border-sakura">
          <h2 class="text-lg font-medium text-charcoal">
            {{ editingFile?.path }}
          </h2>
          <button @click="showEditorModal = false" class="text-stone hover:text-charcoal">
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>
        </div>

        <div class="flex-1 overflow-hidden p-4">
          <textarea
            v-model="fileContent"
            class="w-full h-full font-mono text-sm border border-gray-200 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            :placeholder="$t('admin.skills.contentPlaceholder')"
          ></textarea>
        </div>

        <div class="flex items-center justify-end gap-3 p-4 border-t border-sakura">
          <button @click="showEditorModal = false" class="btn-outline">{{ $t('admin.common.cancel') }}</button>
          <button
            @click="saveFile"
            :disabled="saving"
            class="btn-primary disabled:opacity-50"
          >
            {{ saving ? $t('admin.skills.saving') : $t('admin.common.save') }}
          </button>
        </div>
      </div>
    </div>

    <!-- New File Modal -->
    <div v-if="showNewFileModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4" @click.self="showNewFileModal = false">
      <div class="bg-white rounded-xl max-w-md w-full p-6">
        <h2 class="text-lg font-medium text-charcoal mb-4">{{ $t('admin.skills.createNew') }}</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-700 mb-1">{{ $t('admin.skills.fileName') }}</label>
            <input
              v-model="newFileName"
              type="text"
              class="input-field w-full"
              :placeholder="newFileIsDir ? 'directory-name' : 'filename.md'"
            />
          </div>
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="newFileIsDir" :value="false" class="text-indigo-600" />
              <span class="text-sm">{{ $t('admin.skills.fileType') }}</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="newFileIsDir" :value="true" class="text-indigo-600" />
              <span class="text-sm">{{ $t('admin.skills.directoryType') }}</span>
            </label>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 mt-6">
          <button @click="showNewFileModal = false" class="btn-outline">{{ $t('admin.common.cancel') }}</button>
          <button
            @click="createNewFile"
            :disabled="!newFileName.trim()"
            class="btn-primary disabled:opacity-50"
          >
            {{ $t('admin.skills.create') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Search Modal -->
    <div v-if="showSearchModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showSearchModal = false">
      <div class="bg-white rounded-xl max-w-3xl w-full h-[80vh] flex flex-col">
        <div class="flex items-center justify-between p-6 border-b border-sakura">
          <h2 class="text-xl font-medium text-charcoal">{{ $t('admin.skills.searchInstall') }}</h2>
          <button @click="showSearchModal = false" class="text-stone hover:text-charcoal">
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>
        </div>

        <div class="p-6 border-b border-sakura">
          <div class="relative">
            <Icon name="heroicons:magnifying-glass" class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              v-model="searchKeyword"
              type="text"
              class="input-field pl-12 w-full"
              :placeholder="$t('admin.skills.searchPlaceholder')"
              @keyup.enter="searchSkills"
            />
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <div v-if="isSearching" class="flex items-center justify-center py-12">
            <Icon name="heroicons:arrow-path" class="w-8 h-8 animate-spin text-gray-400" />
          </div>
          <div v-else-if="searchResults.length === 0" class="text-center py-12 text-gray-500">
            <p v-if="hasSearched">{{ $t('admin.skills.noResults') }}</p>
            <p v-else>{{ $t('admin.skills.searchHint') }}</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="skill in searchResults"
              :key="skill.id"
              class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="font-medium text-charcoal">{{ skill.name }}</h4>
                  <p class="text-xs text-gray-500 mt-1">{{ skill.source }}</p>
                  <p class="text-xs text-gray-400 mt-2">{{ formatInstalls(skill.installs) }} {{ $t('admin.skills.installs') }}</p>
                </div>
                <button
                  @click="installSkill(skill)"
                  :disabled="installingSkill === skill.id"
                  class="btn-primary px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  <Icon v-if="installingSkill === skill.id" name="heroicons:arrow-path" class="w-4 h-4 mr-1 animate-spin" />
                  {{ installingSkill === skill.id ? $t('admin.skills.installing') : $t('admin.skills.install') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Install Output Modal -->
    <div v-if="showInstallOutput" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[80] p-4" @click.self="showInstallOutput = false">
      <div class="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div class="flex items-center justify-between p-4 border-b border-sakura">
          <h2 class="text-lg font-medium text-charcoal">
            {{ installOutputSuccess ? $t('admin.skills.installComplete') : $t('admin.skills.installFailed') }}
          </h2>
          <button @click="showInstallOutput = false" class="text-stone hover:text-charcoal">
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>
        </div>
        <div class="flex-1 overflow-auto p-4 min-h-[200px]">
          <pre v-if="installOutput" class="text-xs font-mono bg-gray-100 p-4 rounded-lg whitespace-pre-wrap break-all">{{ installOutput }}</pre>
          <div v-else class="text-center text-gray-500 py-8">{{ $t('admin.skills.noOutput') }}</div>
        </div>
        <div class="flex justify-end gap-3 p-4 border-t border-sakura">
          <button @click="showInstallOutput = false" class="btn-outline">{{ $t('admin.common.cancel') }}</button>
          <button v-if="installOutputSuccess" @click="showInstallOutput = false; scanSkills()" class="btn-primary">
            {{ $t('admin.skills.scanNow') }}
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
  title: () => t('admin.skills.title')
})

interface Skill {
  id: number
  name: string
  path: string
  description?: string
  enabled: boolean
}

interface RemoteSkill {
  id: string
  skillId: string
  name: string
  source: string
  installs: number
}

interface SkillFile {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  modifiedAt?: string
}

const skills = ref<Skill[]>([])
const isScanning = ref(false)

const showBrowseModal = ref(false)
const browsingSkill = ref<Skill | null>(null)
const currentPath = ref('')
const files = ref<SkillFile[]>([])
const isLoadingFiles = ref(false)

const showEditorModal = ref(false)
const editingFile = ref<SkillFile | null>(null)
const fileContent = ref('')
const saving = ref(false)

const showNewFileModal = ref(false)
const newFileName = ref('')
const newFileIsDir = ref(false)

const showSearchModal = ref(false)
const searchKeyword = ref('')
const searchResults = ref<RemoteSkill[]>([])
const isSearching = ref(false)
const hasSearched = ref(false)
const installingSkill = ref<string | null>(null)

const showInstallOutput = ref(false)
const installOutput = ref('')
const installOutputSuccess = ref(false)

onMounted(async () => {
  await loadSkills()
})

const loadSkills = async () => {
  try {
    const response = await $fetch('/api/admin/skills', {
      headers: auth.getAuthHeaders()
    })
    if (response.success && response.data) {
      skills.value = response.data
    }
  } catch (error) {
    console.error('Failed to load skills:', error)
  }
}

const scanSkills = async () => {
  isScanning.value = true
  try {
    await $fetch('/api/admin/skills/scan', { 
      method: 'POST',
      headers: auth.getAuthHeaders()
    })
    await loadSkills()
    alert(t('admin.skills.scanSuccess'))
  } catch (error) {
    console.error('Failed to scan skills:', error)
    alert(t('admin.skills.scanFailed'))
  } finally {
    isScanning.value = false
  }
}

const toggleSkill = async (skill: Skill) => {
  try {
    await $fetch(`/api/admin/skills/${skill.id}/toggle`, {
      method: 'PUT',
      headers: auth.getAuthHeaders()
    })
    skill.enabled = !skill.enabled
  } catch (error) {
    console.error('Failed to toggle skill:', error)
    alert(t('admin.skills.toggleFailed'))
  }
}

const browseSkill = async (skill: Skill) => {
  browsingSkill.value = skill
  currentPath.value = ''
  showBrowseModal.value = true
  await loadFiles()
}

const loadFiles = async () => {
  if (!browsingSkill.value) return
  
  isLoadingFiles.value = true
  try {
    const response = await $fetch(`/api/admin/skills/${browsingSkill.value.id}/files`, {
      params: { path: currentPath.value },
      headers: auth.getAuthHeaders()
    })
    if (response.success && response.data) {
      files.value = response.data.files
    }
  } catch (error) {
    console.error('Failed to load files:', error)
  } finally {
    isLoadingFiles.value = false
  }
}

const enterDirectory = (path: string) => {
  currentPath.value = path
  loadFiles()
}

const goToParent = () => {
  const parts = currentPath.value.split('/')
  parts.pop()
  currentPath.value = parts.join('/')
  loadFiles()
}

const openFile = async (file: SkillFile) => {
  if (!browsingSkill.value) return
  
  editingFile.value = file
  showEditorModal.value = true
  
  try {
    const response = await $fetch(`/api/admin/skills/${browsingSkill.value.id}/file`, {
      params: { file: file.path },
      headers: auth.getAuthHeaders()
    })
    if (response.success && response.data) {
      fileContent.value = response.data.content
    }
  } catch (error) {
    console.error('Failed to load file:', error)
    alert(t('admin.skills.loadFailed'))
    showEditorModal.value = false
  }
}

const saveFile = async () => {
  if (!browsingSkill.value || !editingFile.value) return
  
  saving.value = true
  try {
    await $fetch(`/api/admin/skills/${browsingSkill.value.id}/file`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
      body: { 
        filePath: editingFile.value.path, 
        content: fileContent.value 
      }
    })
    await loadSkills()
    showEditorModal.value = false
    alert(t('admin.skills.saveSuccess'))
  } catch (error) {
    console.error('Failed to save file:', error)
    alert(t('admin.skills.saveFailed'))
  } finally {
    saving.value = false
  }
}

const createNewFile = async () => {
  if (!browsingSkill.value || !newFileName.value.trim()) return
  
  try {
    const filePath = currentPath.value 
      ? `${currentPath.value}/${newFileName.value.trim()}`
      : newFileName.value.trim()
    
    await $fetch(`/api/admin/skills/${browsingSkill.value.id}/file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
      body: { 
        filePath, 
        isDirectory: newFileIsDir.value 
      }
    })
    
    showNewFileModal.value = false
    newFileName.value = ''
    newFileIsDir.value = false
    await loadFiles()
  } catch (error) {
    console.error('Failed to create file:', error)
    alert(t('admin.skills.createFailed'))
  }
}

const confirmDeleteFile = async (file: SkillFile) => {
  if (!browsingSkill.value) return
  if (!confirm(t('admin.common.confirmDelete'))) return
  
  try {
    await $fetch(`/api/admin/skills/${browsingSkill.value.id}/file`, {
      method: 'DELETE',
      params: { file: file.path },
      headers: auth.getAuthHeaders()
    })
    await loadFiles()
  } catch (error) {
    console.error('Failed to delete file:', error)
    alert(t('admin.common.deleteFailed'))
  }
}

const deleteSkill = async (id: number) => {
  if (!confirm(t('admin.common.confirmDelete'))) return
  
  try {
    await $fetch(`/api/admin/skills/${id}`, { 
      method: 'DELETE',
      headers: auth.getAuthHeaders()
    })
    await loadSkills()
  } catch (error) {
    console.error('Failed to delete skill:', error)
    alert(t('admin.common.deleteFailed'))
  }
}

const searchSkills = async () => {
  if (!searchKeyword.value.trim()) return
  
  isSearching.value = true
  hasSearched.value = true
  
  try {
    const response = await $fetch('/api/admin/skills/search', {
      params: { q: searchKeyword.value },
      headers: auth.getAuthHeaders()
    })
    if (response.success && response.data) {
      searchResults.value = response.data
    }
  } catch (error) {
    console.error('Failed to search skills:', error)
    alert(t('admin.skills.searchFailed'))
  } finally {
    isSearching.value = false
  }
}

const installSkill = async (skill: RemoteSkill) => {
  installingSkill.value = skill.id
  
  try {
    const response = await $fetch('/api/admin/skills/install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
      body: { skillId: skill.id }
    })
    
    if (response.success && response.data) {
      installOutput.value = response.data.output || response.data.message || 'No output'
      installOutputSuccess.value = response.data.success
      showInstallOutput.value = true
    }
  } catch (error: any) {
    console.error('Failed to install skill:', error)
    const errorData = error.data?.data || error.data || {}
    installOutput.value = errorData.output || errorData.message || error.message || t('admin.skills.installFailed')
    installOutputSuccess.value = false
    showInstallOutput.value = true
  } finally {
    installingSkill.value = null
  }
}

const formatSize = (bytes?: number) => {
  if (!bytes) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const formatDate = (date?: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

const formatInstalls = (count: number) => {
  if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M'
  if (count >= 1000) return (count / 1000).toFixed(1) + 'K'
  return count.toString()
}

const getFileIcon = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'md': return 'heroicons:document-text'
    case 'js':
    case 'ts':
    case 'json': return 'heroicons:code-bracket'
    case 'py': return 'heroicons:code-bracket'
    case 'sh': return 'heroicons:command-line'
    default: return 'heroicons:document'
  }
}

watch(showSearchModal, (val) => {
  if (!val) {
    searchKeyword.value = ''
    searchResults.value = []
    hasSearched.value = false
  }
})
</script>
