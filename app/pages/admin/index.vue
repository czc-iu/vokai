<template>
  <div class="space-y-6">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-indigo/10 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:document-text" class="w-6 h-6 text-indigo" />
            </div>
            <div>
              <p class="text-sm text-gray-600">{{ $t('admin.dashboard.totalDocuments') }}</p>
              <p class="text-2xl font-bold text-charcoal">{{ stats.documents }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:puzzle-piece" class="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p class="text-sm text-gray-600">{{ $t('admin.dashboard.activeMCP') }}</p>
              <p class="text-2xl font-bold text-charcoal">{{ stats.mcpServices }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:light-bulb" class="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p class="text-sm text-gray-600">{{ $t('admin.dashboard.enabledSkills') }}</p>
              <p class="text-2xl font-bold text-charcoal">{{ stats.skills }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:command-line" class="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p class="text-sm text-gray-600">{{ $t('admin.dashboard.whitelistedCommands') }}</p>
              <p class="text-2xl font-bold text-charcoal">{{ stats.commands }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-medium text-charcoal mb-4">{{ $t('admin.dashboard.quickActions') }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <NuxtLink 
            to="/admin/rag"
            class="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-indigo hover:bg-indigo/5 transition-colors"
          >
            <Icon name="heroicons:document-plus" class="w-5 h-5 text-indigo" />
            <span class="text-sm font-medium text-charcoal">{{ $t('admin.dashboard.indexDocument') }}</span>
          </NuxtLink>

          <NuxtLink 
            to="/admin/mcp"
            class="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-indigo hover:bg-indigo/5 transition-colors"
          >
            <Icon name="heroicons:plus" class="w-5 h-5 text-indigo" />
            <span class="text-sm font-medium text-charcoal">{{ $t('admin.dashboard.addMCP') }}</span>
          </NuxtLink>

          <NuxtLink 
            to="/admin/skills"
            class="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-indigo hover:bg-indigo/5 transition-colors"
          >
            <Icon name="heroicons:arrow-path" class="w-5 h-5 text-indigo" />
            <span class="text-sm font-medium text-charcoal">{{ $t('admin.dashboard.scanSkills') }}</span>
          </NuxtLink>

          <NuxtLink 
            to="/admin/commands"
            class="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-indigo hover:bg-indigo/5 transition-colors"
          >
            <Icon name="heroicons:shield-check" class="w-5 h-5 text-indigo" />
            <span class="text-sm font-medium text-charcoal">{{ $t('admin.dashboard.manageCommands') }}</span>
          </NuxtLink>
        </div>
      </div>

      <!-- System Status -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-medium text-charcoal mb-4">{{ $t('admin.dashboard.systemStatus') }}</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              <span class="text-sm font-medium text-charcoal">{{ $t('admin.dashboard.ragIndex') }}</span>
            </div>
            <span class="text-sm text-gray-600">{{ ragStatus }}</span>
          </div>

          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              <span class="text-sm font-medium text-charcoal">{{ $t('admin.dashboard.database') }}</span>
            </div>
            <span class="text-sm text-green-600">{{ $t('admin.dashboard.connected') }}</span>
          </div>

          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              <span class="text-sm font-medium text-charcoal">{{ $t('admin.dashboard.aiService') }}</span>
            </div>
            <span class="text-sm text-green-600">{{ $t('admin.dashboard.operational') }}</span>
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
  title: () => t('admin.dashboard.title')
})

const stats = ref({
  documents: 0,
  mcpServices: 0,
  skills: 0,
  commands: 0
})

const ragStatus = ref('Checking...')

onMounted(async () => {
  await loadStats()
})

const loadStats = async () => {
  try {
    const [ragRes, mcpRes, skillsRes, commandsRes] = await Promise.all([
      $fetch('/api/admin/rag'),
      $fetch('/api/admin/mcp'),
      $fetch('/api/admin/skills'),
      $fetch('/api/admin/commands')
    ])

    if (ragRes.success && ragRes.data) {
      stats.value.documents = ragRes.data.documents?.length || 0
      ragStatus.value = ragRes.data.isCreated ? t('admin.dashboard.indexed') : t('admin.dashboard.notIndexed')
    }

    if (mcpRes.success && mcpRes.data) {
      stats.value.mcpServices = mcpRes.data.length
    }

    if (skillsRes.success && skillsRes.data) {
      stats.value.skills = skillsRes.data.filter((s: any) => s.enabled).length
    }

    if (commandsRes.success && commandsRes.data) {
      stats.value.commands = commandsRes.data.length
    }
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}
</script>
