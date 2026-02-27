<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-medium text-charcoal">{{ $t('admin.services.serviceList') }}</h2>
        <p class="text-sm text-gray-500 mt-1">{{ $t('admin.services.description') }}</p>
      </div>
      <button
        @click="openCreateModal"
        class="px-4 py-2 bg-indigo text-white text-sm font-medium rounded-lg hover:bg-indigo-dark transition-colors"
      >
        {{ $t('admin.services.addService') }}
      </button>
    </div>

    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.services.table.name') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.services.table.tokens') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.services.table.price') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.services.table.validity') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.services.table.status') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.services.table.sortOrder') }}</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.services.table.actions') }}</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="service in services" :key="service.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div>
                  <div class="text-sm font-medium text-charcoal">{{ service.name }}</div>
                  <div v-if="service.is_popular" class="text-xs text-indigo">{{ $t('services.popular') }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ formatNumber(service.tokens) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              ¥{{ service.price }}
              <span v-if="service.original_price" class="text-gray-400 line-through ml-1">¥{{ service.original_price }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ service.validity_days ? $t('services.validity', { days: service.validity_days }) : $t('services.permanent') }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="service.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
              >
                {{ service.is_active ? $t('admin.services.active') : $t('admin.services.inactive') }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ service.sort_order }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
              <button 
                @click="toggleStatus(service)"
                class="text-gray-600 hover:text-indigo"
              >
                {{ service.is_active ? $t('admin.services.deactivate') : $t('admin.services.activate') }}
              </button>
              <button 
                @click="openEditModal(service)"
                class="text-indigo hover:text-indigo-dark"
              >
                {{ $t('common.edit') }}
              </button>
              <button 
                @click="confirmDelete(service)"
                class="text-red-600 hover:text-red-900"
              >
                {{ $t('admin.common.delete') }}
              </button>
            </td>
          </tr>
          <tr v-if="services.length === 0">
            <td colspan="7" class="px-6 py-12 text-center text-gray-500">
              {{ $t('admin.services.noServices') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
        <h3 class="text-lg font-medium text-charcoal mb-4">
          {{ isEditing ? $t('admin.services.editService') : $t('admin.services.addService') }}
        </h3>
        <form @submit.prevent="saveService" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('admin.services.form.name') }} *</label>
            <input 
              v-model="form.name" 
              type="text" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo focus:border-indigo"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('admin.services.form.description') }}</label>
            <textarea 
              v-model="form.description" 
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo focus:border-indigo"
            ></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('admin.services.form.tokens') }} *</label>
              <input 
                v-model.number="form.tokens" 
                type="number" 
                required
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo focus:border-indigo"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('admin.services.form.price') }} *</label>
              <input 
                v-model.number="form.price" 
                type="number" 
                required
                min="0"
                step="0.01"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo focus:border-indigo"
              />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('admin.services.form.originalPrice') }}</label>
              <input 
                v-model.number="form.original_price" 
                type="number" 
                min="0"
                step="0.01"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo focus:border-indigo"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('admin.services.form.validityDays') }}</label>
              <input 
                v-model.number="form.validity_days" 
                type="number" 
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo focus:border-indigo"
              />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('admin.services.form.sortOrder') }}</label>
              <input 
                v-model.number="form.sort_order" 
                type="number" 
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo focus:border-indigo"
              />
            </div>
            <div class="flex items-center pt-6">
              <label class="flex items-center">
                <input 
                  v-model="form.is_popular" 
                  type="checkbox"
                  class="w-4 h-4 text-indigo border-gray-300 rounded focus:ring-indigo"
                />
                <span class="ml-2 text-sm text-gray-700">{{ $t('admin.services.form.isPopular') }}</span>
              </label>
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button 
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              {{ $t('admin.common.cancel') }}
            </button>
            <button 
              type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-indigo rounded-lg hover:bg-indigo-dark"
            >
              {{ $t('admin.common.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-medium text-charcoal mb-4">{{ $t('admin.common.confirmDelete') }}</h3>
        <p class="text-sm text-gray-500 mb-6">{{ $t('admin.services.deleteConfirm', { name: deleteTarget?.name }) }}</p>
        <div class="flex justify-end gap-3">
          <button 
            @click="showDeleteConfirm = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            {{ $t('admin.common.cancel') }}
          </button>
          <button 
            @click="deleteService"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            {{ $t('admin.common.delete') }}
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
  title: () => t('admin.services.title')
})

interface Service {
  id: number
  name: string
  description: string | null
  tokens: number
  price: number
  original_price: number | null
  validity_days: number | null
  features: string[] | null
  is_popular: boolean
  is_active: boolean
  sort_order: number
}

const services = ref<Service[]>([])
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const deleteTarget = ref<Service | null>(null)

const form = ref({
  name: '',
  description: '',
  tokens: 0,
  price: 0,
  original_price: null as number | null,
  validity_days: null as number | null,
  is_popular: false,
  sort_order: 0
})

const formatNumber = (num: number) => {
  return num.toLocaleString()
}

const loadServices = async () => {
  try {
    const res = await $fetch('/api/admin/services', {
      headers: auth.getAuthHeaders()
    })
    if (res.success) {
      services.value = res.data
    }
  } catch (error) {
    console.error('Failed to load services:', error)
  }
}

const openCreateModal = () => {
  isEditing.value = false
  editingId.value = null
  form.value = {
    name: '',
    description: '',
    tokens: 0,
    price: 0,
    original_price: null,
    validity_days: null,
    is_popular: false,
    sort_order: 0
  }
  showModal.value = true
}

const openEditModal = (service: Service) => {
  isEditing.value = true
  editingId.value = service.id
  form.value = {
    name: service.name,
    description: service.description || '',
    tokens: service.tokens,
    price: service.price,
    original_price: service.original_price,
    validity_days: service.validity_days,
    is_popular: service.is_popular,
    sort_order: service.sort_order
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveService = async () => {
  try {
    if (isEditing.value && editingId.value) {
      await $fetch(`/api/admin/services/${editingId.value}`, {
        method: 'PUT',
        headers: auth.getAuthHeaders(),
        body: form.value
      })
    } else {
      await $fetch('/api/admin/services', {
        method: 'POST',
        headers: auth.getAuthHeaders(),
        body: form.value
      })
    }
    showModal.value = false
    await loadServices()
  } catch (error) {
    console.error('Failed to save service:', error)
  }
}

const toggleStatus = async (service: Service) => {
  try {
    await $fetch(`/api/admin/services/${service.id}/status`, {
      method: 'PUT',
      headers: auth.getAuthHeaders(),
      body: { is_active: !service.is_active }
    })
    await loadServices()
  } catch (error) {
    console.error('Failed to toggle status:', error)
  }
}

const confirmDelete = (service: Service) => {
  deleteTarget.value = service
  showDeleteConfirm.value = true
}

const deleteService = async () => {
  if (!deleteTarget.value) return
  
  try {
    await $fetch(`/api/admin/services/${deleteTarget.value.id}`, {
      method: 'DELETE',
      headers: auth.getAuthHeaders()
    })
    showDeleteConfirm.value = false
    deleteTarget.value = null
    await loadServices()
  } catch (error) {
    console.error('Failed to delete service:', error)
  }
}

onMounted(() => {
  loadServices()
})
</script>
