<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div class="h-16 flex items-center justify-center border-b border-gray-200">
        <NuxtLink to="/admin" class="text-xl font-brand text-charcoal">
          TOMYBOT
        </NuxtLink>
      </div>

      <nav class="flex-1 p-4 space-y-1">
        <NuxtLink 
          to="/admin" 
          class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors"
          :class="$route.path === '/admin' ? 'bg-indigo text-white' : 'text-gray-700 hover:bg-gray-100'"
        >
          <Icon name="heroicons:home" class="w-5 h-5" />
          {{ $t('admin.nav.dashboard') }}
        </NuxtLink>

        <NuxtLink 
          to="/admin/rag" 
          class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors"
          :class="$route.path === '/admin/rag' ? 'bg-indigo text-white' : 'text-gray-700 hover:bg-gray-100'"
        >
          <Icon name="heroicons:document-text" class="w-5 h-5" />
          {{ $t('admin.nav.rag') }}
        </NuxtLink>

        <NuxtLink 
          to="/admin/mcp" 
          class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors"
          :class="$route.path === '/admin/mcp' ? 'bg-indigo text-white' : 'text-gray-700 hover:bg-gray-100'"
        >
          <Icon name="heroicons:puzzle-piece" class="w-5 h-5" />
          {{ $t('admin.nav.mcp') }}
        </NuxtLink>

        <NuxtLink 
          to="/admin/skills" 
          class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors"
          :class="$route.path === '/admin/sills' ? 'bg-indigo text-white' : 'text-gray-700 hover:bg-gray-100'"
        >
          <Icon name="heroicons:light-bulb" class="w-5 h-5" />
          {{ $t('admin.nav.skills') }}
        </NuxtLink>

        <NuxtLink 
          to="/admin/commands" 
          class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors"
          :class="$route.path === '/admin/commands' ? 'bg-indigo text-white' : 'text-gray-700 hover:bg-gray-100'"
        >
          <Icon name="heroicons:command-line" class="w-5 h-5" />
          {{ $t('admin.nav.commands') }}
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-gray-200">
        <NuxtLink 
          to="/" 
          class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Icon name="heroicons:arrow-left" class="w-5 h-5" />
          {{ $t('admin.nav.backToSite') }}
        </NuxtLink>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col">
      <!-- Header -->
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <h1 class="text-xl font-medium text-charcoal">{{ pageTitle }}</h1>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600">{{ user?.email }}</span>
          <button 
            @click="handleLogout"
            class="text-sm text-gray-600 hover:text-gray-900"
          >
            {{ $t('admin.nav.logout') }}
          </button>
        </div>
      </header>

      <!-- Content -->
      <div class="flex-1 p-6 overflow-y-auto">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuth()
const user = useUser()

const pageTitle = computed(() => {
  const path = route.path
  if (path === '/admin') return t('admin.dashboard.title')
  if (path === '/admin/rag') return t('admin.rag.title')
  if (path === '/admin/mcp') return t('admin.mcp.title')
  if (path === '/admin/skills') return t('admin.skills.title')
  if (path === '/admin/commands') return t('admin.commands.title')
  return 'Admin'
})

const handleLogout = async () => {
  await auth.logout()
  router.push('/login')
}
</script>
