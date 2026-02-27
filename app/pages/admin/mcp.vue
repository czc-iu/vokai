<template>
  <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-lg font-medium text-charcoal">{{ $t('admin.mcp.serviceList') }}</h2>
          <p class="text-sm text-gray-600 mt-1">{{ $t('admin.mcp.description') }}</p>
        </div>
        <button
          @click="showAddModal = true"
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
              <div>
                <h3 class="text-sm font-medium text-charcoal">{{ service.name }}</h3>
                <p class="text-xs text-gray-500 mt-1">{{ service.command }}</p>
              </div>
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

      <!-- Add Modal -->
      <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 class="text-lg font-medium text-charcoal mb-4">{{ $t('admin.mcp.addService') }}</h3>
          <form @submit.prevent="addService">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('admin.mcp.form.name') }}</label>
                <input v-model="newService.name" type="text" class="input-field" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('admin.mcp.form.command') }}</label>
                <input v-model="newService.command" type="text" class="input-field" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('admin.mcp.form.args') }}</label>
                <input v-model="newService.args" type="text" class="input-field" placeholder='["arg1", "arg2"]' />
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button type="button" @click="showAddModal = false" class="btn-outline px-4 py-2 text-sm">
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

useHead({
  title: () => t('admin.mcp.title')
})

interface MCPService {
  id: number
  name: string
  command: string
  args?: string
}

const services = ref<MCPService[]>([])
const showAddModal = ref(false)
const newService = ref({
  name: '',
  command: '',
  args: ''
})

onMounted(async () => {
  await loadServices()
})

const loadServices = async () => {
  try {
    const response = await $fetch('/api/admin/mcp')
    if (response.success && response.data) {
      services.value = response.data
    }
  } catch (error) {
    console.error('Failed to load MCP services:', error)
  }
}

const addService = async () => {
  try {
    const response = await $fetch('/api/admin/mcp', {
      method: 'POST',
      body: {
        name: newService.value.name,
        command: newService.value.command,
        args: newService.value.args ? JSON.parse(newService.value.args) : []
      }
    })
    if (response.success) {
      showAddModal.value = false
      newService.value = { name: '', command: '', args: '' }
      await loadServices()
    }
  } catch (error) {
    console.error('Failed to add service:', error)
    alert(t('admin.common.addFailed'))
  }
}

const deleteService = async (id: number) => {
  if (!confirm(t('admin.common.confirmDelete'))) return
  
  try {
    await $fetch(`/api/admin/mcp/${id}`, { method: 'DELETE' })
    await loadServices()
  } catch (error) {
    console.error('Failed to delete service:', error)
    alert(t('admin.common.deleteFailed'))
  }
}
</script>
