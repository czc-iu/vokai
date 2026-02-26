<template>
  <NuxtLayout name="admin">
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-lg font-medium text-charcoal">{{ $t('admin.skills.skillList') }}</h2>
          <p class="text-sm text-gray-600 mt-1">{{ $t('admin.skills.description') }}</p>
        </div>
        <button
          @click="scanSkills"
          :disabled="isScanning"
          class="btn-primary px-6 py-2.5 text-sm disabled:opacity-50"
        >
          <Icon v-if="isScanning" name="heroicons:arrow-path" class="w-4 h-4 mr-2 animate-spin" />
          {{ $t('admin.skills.scanNow') }}
        </button>
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
                  <span v-if="skill.is_enabled" class="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    {{ $t('admin.skills.enabled') }}
                  </span>
                  <span v-else class="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                    {{ $t('admin.skills.disabled') }}
                  </span>
                </div>
                <p class="text-xs text-gray-500 mt-1">{{ skill.path }}</p>
              </div>
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
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { t } = useI18n()

useHead({
  title: () => t('admin.skills.title')
})

interface Skill {
  id: number
  name: string
  path: string
  is_enabled: boolean
}

const skills = ref<Skill[]>([])
const isScanning = ref(false)

onMounted(async () => {
  await loadSkills()
})

const loadSkills = async () => {
  try {
    const response = await $fetch('/api/admin/skills')
    if (response.success) {
      skills.value = response.data
    }
  } catch (error) {
    console.error('Failed to load skills:', error)
  }
}

const scanSkills = async () => {
  isScanning.value = true
  try {
    await $fetch('/api/admin/skills/scan', { method: 'POST' })
    await loadSkills()
    alert(t('admin.skills.scanSuccess'))
  } catch (error) {
    console.error('Failed to scan skills:', error)
    alert(t('admin.skills.scanFailed'))
  } finally {
    isScanning.value = false
  }
}

const deleteSkill = async (id: number) => {
  if (!confirm(t('admin.common.confirmDelete'))) return
  
  try {
    await $fetch(`/api/admin/skills/${id}`, { method: 'DELETE' })
    await loadSkills()
  } catch (error) {
    console.error('Failed to delete skill:', error)
    alert(t('admin.common.deleteFailed'))
  }
}
</script>
