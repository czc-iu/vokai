<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-medium text-charcoal">{{ $t('admin.admins.adminList') }}</h2>
        <p class="text-sm text-gray-500 mt-1">{{ $t('admin.admins.description') }}</p>
      </div>
      <button
        @click="openCreateModal"
        class="px-4 py-2 bg-indigo text-white text-sm font-medium rounded-lg hover:bg-indigo-dark transition-colors"
      >
        {{ $t('admin.admins.addAdmin') }}
      </button>
    </div>

    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.admins.table.user') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.admins.table.role') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.admins.table.permissions') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.admins.table.status') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.admins.table.createdAt') }}</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.admins.table.actions') }}</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="admin in admins" :key="admin.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div>
                <div class="text-sm font-medium text-charcoal">{{ admin.name || admin.email }}</div>
                <div class="text-sm text-gray-500">{{ admin.email }}</div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="{
                  'bg-purple-100 text-purple-800': admin.role === 'super_admin',
                  'bg-blue-100 text-blue-800': admin.role === 'admin'
                }"
              >
                {{ getRoleText(admin.role) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex flex-wrap gap-1">
                <span 
                  v-for="perm in (admin.permissions || []).slice(0, 3)" 
                  :key="perm"
                  class="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                >
                  {{ perm }}
                </span>
                <span 
                  v-if="(admin.permissions || []).length > 3"
                  class="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                >
                  +{{ (admin.permissions || []).length - 3 }}
                </span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="{
                  'bg-green-100 text-green-800': admin.status === 'active',
                  'bg-gray-100 text-gray-800': admin.status === 'inactive',
                  'bg-red-100 text-red-800': admin.status === 'suspended'
                }"
              >
                {{ getStatusText(admin.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(admin.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
              <button 
                v-if="admin.role !== 'super_admin'"
                @click="openEditModal(admin)"
                class="text-indigo hover:text-indigo-dark"
              >
                {{ $t('common.edit') }}
              </button>
              <button 
                v-if="admin.role !== 'super_admin'"
                @click="confirmDelete(admin)"
                class="text-red-600 hover:text-red-900"
              >
                {{ $t('admin.common.delete') }}
              </button>
            </td>
          </tr>
          <tr v-if="admins.length === 0">
            <td colspan="6" class="px-6 py-12 text-center text-gray-500">
              {{ $t('admin.admins.noAdmins') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-medium text-charcoal mb-4">
          {{ isEditing ? $t('admin.admins.editAdmin') : $t('admin.admins.addAdmin') }}
        </h3>
        <form @submit.prevent="saveAdmin" class="space-y-4">
          <div v-if="!isEditing">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('admin.admins.form.userId') }} *</label>
            <input 
              v-model.number="form.userId" 
              type="number" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo focus:border-indigo"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('admin.admins.form.role') }}</label>
            <select 
              v-model="form.role"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo focus:border-indigo"
            >
              <option value="admin">{{ $t('admin.admins.roleAdmin') }}</option>
            </select>
          </div>
          <div v-if="isEditing">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('admin.admins.form.status') }}</label>
            <select 
              v-model="form.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo focus:border-indigo"
            >
              <option value="active">{{ $t('admin.admins.statusActive') }}</option>
              <option value="inactive">{{ $t('admin.admins.statusInactive') }}</option>
              <option value="suspended">{{ $t('admin.admins.statusSuspended') }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('admin.admins.form.permissions') }}</label>
            <div class="space-y-2">
              <label v-for="perm in availablePermissions" :key="perm" class="flex items-center">
                <input 
                  v-model="form.permissions"
                  type="checkbox"
                  :value="perm"
                  class="w-4 h-4 text-indigo border-gray-300 rounded focus:ring-indigo"
                />
                <span class="ml-2 text-sm text-gray-700">{{ perm }}</span>
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
        <p class="text-sm text-gray-500 mb-6">{{ $t('admin.admins.deleteConfirm', { email: deleteTarget?.email }) }}</p>
        <div class="flex justify-end gap-3">
          <button 
            @click="showDeleteConfirm = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            {{ $t('admin.common.cancel') }}
          </button>
          <button 
            @click="deleteAdmin"
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
  title: () => t('admin.admins.title')
})

interface Admin {
  id: number
  user_id: number
  email: string
  name: string | null
  role: string
  permissions: string[]
  status: string
  created_at: string
}

const availablePermissions = ['all', 'users', 'orders', 'services', 'rag', 'mcp', 'skills', 'commands']

const admins = ref<Admin[]>([])
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const deleteTarget = ref<Admin | null>(null)

const form = ref({
  userId: null as number | null,
  role: 'admin',
  status: 'active',
  permissions: [] as string[]
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const getRoleText = (role: string) => {
  switch (role) {
    case 'super_admin': return t('admin.admins.roleSuperAdmin')
    case 'admin': return t('admin.admins.roleAdmin')
    default: return role
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return t('admin.admins.statusActive')
    case 'inactive': return t('admin.admins.statusInactive')
    case 'suspended': return t('admin.admins.statusSuspended')
    default: return status
  }
}

const loadAdmins = async () => {
  try {
    const res = await $fetch('/api/admin/admins', {
      headers: auth.getAuthHeaders()
    })
    if (res.success) {
      admins.value = res.data.admins
    }
  } catch (error) {
    console.error('Failed to load admins:', error)
  }
}

const openCreateModal = () => {
  isEditing.value = false
  editingId.value = null
  form.value = {
    userId: null,
    role: 'admin',
    status: 'active',
    permissions: []
  }
  showModal.value = true
}

const openEditModal = (admin: Admin) => {
  isEditing.value = true
  editingId.value = admin.id
  form.value = {
    userId: admin.user_id,
    role: admin.role,
    status: admin.status,
    permissions: admin.permissions || []
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveAdmin = async () => {
  try {
    if (isEditing.value && editingId.value) {
      await $fetch(`/api/admin/admins/${editingId.value}`, {
        method: 'PUT',
        headers: auth.getAuthHeaders(),
        body: {
          role: form.value.role,
          status: form.value.status,
          permissions: form.value.permissions
        }
      })
    } else {
      await $fetch('/api/admin/admins', {
        method: 'POST',
        headers: auth.getAuthHeaders(),
        body: form.value
      })
    }
    showModal.value = false
    await loadAdmins()
  } catch (error) {
    console.error('Failed to save admin:', error)
  }
}

const confirmDelete = (admin: Admin) => {
  deleteTarget.value = admin
  showDeleteConfirm.value = true
}

const deleteAdmin = async () => {
  if (!deleteTarget.value) return
  
  try {
    await $fetch(`/api/admin/admins/${deleteTarget.value.id}`, {
      method: 'DELETE',
      headers: auth.getAuthHeaders()
    })
    showDeleteConfirm.value = false
    deleteTarget.value = null
    await loadAdmins()
  } catch (error) {
    console.error('Failed to delete admin:', error)
  }
}

onMounted(() => {
  loadAdmins()
})
</script>
