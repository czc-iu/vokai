<template>
  <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-lg font-medium text-charcoal">{{ $t('admin.mcp.serviceList') }}</h2>
          <p class="text-sm text-gray-600 mt-1">{{ $t('admin.mcp.description') }}</p>
        </div>
        <button
          @click="openAddModal"
          class="btn-primary px-6 py-2.5 text-sm"
        >
          <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
          {{ $t('admin.mcp.addService') }}
        </button>
      </div>

      <div class="bg-white rounded-lg border border-gray-200">
        <div v-if="services.length === 0" class="p-12 text-center text-gray-500">
          {{ $t('admin.mcp.noServices') }}
        </div>
        <div v-else class="divide-y divide-gray-200">
          <div v-for="service in services" :key="service.id" class="p-6 hover:bg-gray-50">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3">
                  <h3 class="text-sm font-medium text-charcoal">{{ service.name }}</h3>
                  <span 
                    :class="[
                      'px-2 py-0.5 text-xs rounded-full',
                      service.status === 'active' ? 'bg-green-100 text-green-800' :
                      service.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ service.status === 'active' ? '运行中' : service.status === 'inactive' ? '已停用' : '错误' }}
                  </span>
                </div>
                <p class="text-xs text-gray-500 mt-1">{{ service.command }}</p>
                <p v-if="service.description" class="text-xs text-gray-400 mt-1">{{ service.description }}</p>
              </div>
              <div class="flex items-center gap-3">
                <button
                  @click="toggleStatus(service)"
                  :class="[
                    'text-xs px-3 py-1 rounded',
                    service.status === 'active' ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'
                  ]"
                >
                  {{ service.status === 'active' ? '停用' : '启用' }}
                </button>
                <button
                  @click="openEditModal(service)"
                  class="text-indigo-600 hover:text-indigo-700 text-sm"
                >
                  {{ $t('admin.common.edit') }}
                </button>
                <button
                  @click="deleteService(service.id)"
                  class="text-red-600 hover:text-red-700 text-sm"
                >
                  {{ $t('admin.common.delete') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <h3 class="text-lg font-medium text-charcoal mb-4">
            {{ isEditing ? $t('admin.mcp.editService') : $t('admin.mcp.addService') }}
          </h3>
          <form @submit.prevent="saveService">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('admin.mcp.form.name') }}</label>
                <input v-model="formData.name" type="text" class="input-field" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('admin.mcp.form.command') }}</label>
                <input v-model="formData.command" type="text" class="input-field" required placeholder="node, python3, uvx..." />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('admin.mcp.form.args') }}</label>
                <input v-model="formData.argsText" type="text" class="input-field" placeholder='["arg1", "arg2"]' />
                <p class="text-xs text-gray-400 mt-1">JSON 数组格式</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('admin.mcp.form.env') }}</label>
                <textarea v-model="formData.envText" class="input-field" rows="2" placeholder='{"KEY": "value"}'></textarea>
                <p class="text-xs text-gray-400 mt-1">JSON 对象格式</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('admin.mcp.form.description') }}</label>
                <textarea v-model="formData.description" class="input-field" rows="2"></textarea>
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button type="button" @click="closeModal" class="btn-outline px-4 py-2 text-sm">
                {{ $t('admin.common.cancel') }}
              </button>
              <button type="submit" class="btn-primary px-4 py-2 text-sm">
                {{ $t('admin.common.save') }}
              </button>
            </div>
          </form>
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
  title: () => t('admin.mcp.title')
})

interface MCPService {
  id: number
  name: string
  command: string
  args?: string[]
  env?: Record<string, string>
  status: 'active' | 'inactive' | 'error'
  description?: string
}

const services = ref<MCPService[]>([])
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const formData = ref({
  name: '',
  command: '',
  argsText: '',
  envText: '',
  description: ''
})

onMounted(async () => {
  await loadServices()
})

const loadServices = async () => {
  try {
    const response = await $fetch('/api/admin/mcp', {
      headers: auth.getAuthHeaders()
    })
    if (response.success && response.data) {
      services.value = response.data
    }
  } catch (error) {
    console.error('Failed to load MCP services:', error)
  }
}

const openAddModal = () => {
  isEditing.value = false
  editingId.value = null
  formData.value = {
    name: '',
    command: '',
    argsText: '',
    envText: '',
    description: ''
  }
  showModal.value = true
}

const openEditModal = (service: MCPService) => {
  isEditing.value = true
  editingId.value = service.id
  formData.value = {
    name: service.name,
    command: service.command,
    argsText: Array.isArray(service.args) ? JSON.stringify(service.args) : '',
    envText: service.env && Object.keys(service.env).length > 0 ? JSON.stringify(service.env) : '',
    description: service.description || ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  isEditing.value = false
  editingId.value = null
}

const saveService = async () => {
  try {
    let args: string[] = []
    let env: Record<string, string> = {}
    
    if (formData.value.argsText.trim()) {
      try {
        args = JSON.parse(formData.value.argsText)
      } catch {
        alert('参数格式错误，请使用 JSON 数组格式')
        return
      }
    }
    
    if (formData.value.envText.trim()) {
      try {
        env = JSON.parse(formData.value.envText)
      } catch {
        alert('环境变量格式错误，请使用 JSON 对象格式')
        return
      }
    }

    const body = {
      name: formData.value.name,
      command: formData.value.command,
      args,
      env,
      description: formData.value.description || undefined
    }

    if (isEditing.value && editingId.value) {
      await $fetch(`/api/admin/mcp/${editingId.value}`, {
        method: 'PUT',
        headers: auth.getAuthHeaders(),
        body
      })
    } else {
      await $fetch('/api/admin/mcp', {
        method: 'POST',
        headers: auth.getAuthHeaders(),
        body
      })
    }
    
    closeModal()
    await loadServices()
  } catch (error) {
    console.error('Failed to save service:', error)
    alert(t('admin.common.saveFailed'))
  }
}

const toggleStatus = async (service: MCPService) => {
  try {
    const newStatus = service.status === 'active' ? 'inactive' : 'active'
    await $fetch(`/api/admin/mcp/${service.id}`, {
      method: 'PUT',
      headers: auth.getAuthHeaders(),
      body: { status: newStatus }
    })
    await loadServices()
  } catch (error) {
    console.error('Failed to toggle status:', error)
    alert(t('admin.common.saveFailed'))
  }
}

const deleteService = async (id: number) => {
  if (!confirm(t('admin.common.confirmDelete'))) return
  
  try {
    await $fetch(`/api/admin/mcp/${id}`, { 
      method: 'DELETE',
      headers: auth.getAuthHeaders()
    })
    await loadServices()
  } catch (error) {
    console.error('Failed to delete service:', error)
    alert(t('admin.common.deleteFailed'))
  }
}
</script>
