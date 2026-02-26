<template>
  <NuxtLayout name="admin">
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-lg font-medium text-charcoal">{{ $t('admin.commands.commandList') }}</h2>
          <p class="text-sm text-gray-600 mt-1">{{ $t('admin.commands.description') }}</p>
        </div>
        <button
          @click="showAddModal = true"
          class="btn-primary px-6 py-2.5 text-sm"
        >
          <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
          {{ $t('admin.commands.addCommand') }}
        </button>
      </div>

      <div class="bg-white rounded-lg border border-gray-200">
        <div v-if="commands.length === 0" class="p-12 text-center text-gray-500">
          {{ $t('admin.commands.noCommands') }}
        </div>
        <div v-else class="divide-y divide-gray-200">
          <div v-for="command in commands" :key="command.id" class="p-6 hover:bg-gray-50">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-charcoal font-mono">{{ command.command }}</h3>
                <p class="text-xs text-gray-500 mt-1">{{ command.description }}</p>
              </div>
              <button
                @click="deleteCommand(command.id)"
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
          <h3 class="text-lg font-medium text-charcoal mb-4">{{ $t('admin.commands.addCommand') }}</h3>
          <form @submit.prevent="addCommand">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('admin.commands.form.command') }}</label>
                <input v-model="newCommand.command" type="text" class="input-field font-mono" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('admin.commands.form.description') }}</label>
                <input v-model="newCommand.description" type="text" class="input-field" />
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
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { t } = useI18n()

useHead({
  title: () => t('admin.commands.title')
})

interface Command {
  id: number
  command: string
  description?: string
}

const commands = ref<Command[]>([])
const showAddModal = ref(false)
const newCommand = ref({
  command: '',
  description: ''
})

onMounted(async () => {
  await loadCommands()
})

const loadCommands = async () => {
  try {
    const response = await $fetch('/api/admin/commands')
    if (response.success) {
      commands.value = response.data
    }
  } catch (error) {
    console.error('Failed to load commands:', error)
  }
}

const addCommand = async () => {
  try {
    const response = await $fetch('/api/admin/commands', {
      method: 'POST',
      body: newCommand.value
    })
    if (response.success) {
      showAddModal.value = false
      newCommand.value = { command: '', description: '' }
      await loadCommands()
    }
  } catch (error) {
    console.error('Failed to add command:', error)
    alert(t('admin.common.addFailed'))
  }
}

const deleteCommand = async (id: number) => {
  if (!confirm(t('admin.common.confirmDelete'))) return
  
  try {
    await $fetch(`/api/admin/commands/${id}`, { method: 'DELETE' })
    await loadCommands()
  } catch (error) {
    console.error('Failed to delete command:', error)
    alert(t('admin.common.deleteFailed'))
  }
}
</script>
