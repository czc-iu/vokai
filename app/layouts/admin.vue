<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div class="h-16 flex items-center justify-center border-b border-gray-200">
        <NuxtLink to="/admin" class="text-xl font-brand text-charcoal">
          TOMYBOT
        </NuxtLink>
      </div>

      <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        <NuxtLink 
          to="/admin" 
          class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors"
          :class="$route.path === '/admin' ? 'bg-indigo text-white' : 'text-gray-700 hover:bg-gray-100'"
        >
          <Icon name="heroicons:home" class="w-5 h-5" />
          {{ $t('admin.nav.dashboard') }}
        </NuxtLink>

        <div class="pt-4 pb-2">
          <p class="px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">{{ $t('admin.nav.businessManagement') }}</p>
        </div>

        <NuxtLink 
          to="/admin/services" 
          class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors"
          :class="$route.path.startsWith('/admin/services') ? 'bg-indigo text-white' : 'text-gray-700 hover:bg-gray-100'"
        >
          <Icon name="heroicons:cube" class="w-5 h-5" />
          {{ $t('admin.nav.services') }}
        </NuxtLink>

        <NuxtLink 
          to="/admin/users" 
          class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors"
          :class="$route.path.startsWith('/admin/users') ? 'bg-indigo text-white' : 'text-gray-700 hover:bg-gray-100'"
        >
          <Icon name="heroicons:users" class="w-5 h-5" />
          {{ $t('admin.nav.users') }}
        </NuxtLink>

        <NuxtLink 
          to="/admin/orders" 
          class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors"
          :class="$route.path.startsWith('/admin/orders') ? 'bg-indigo text-white' : 'text-gray-700 hover:bg-gray-100'"
        >
          <Icon name="heroicons:shopping-bag" class="w-5 h-5" />
          {{ $t('admin.nav.orders') }}
        </NuxtLink>

        <NuxtLink 
          to="/admin/transactions" 
          class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors"
          :class="$route.path === '/admin/transactions' ? 'bg-indigo text-white' : 'text-gray-700 hover:bg-gray-100'"
        >
          <Icon name="heroicons:currency-dollar" class="w-5 h-5" />
          {{ $t('admin.nav.transactions') }}
        </NuxtLink>

        <NuxtLink 
          to="/admin/usage" 
          class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors"
          :class="$route.path === '/admin/usage' ? 'bg-indigo text-white' : 'text-gray-700 hover:bg-gray-100'"
        >
          <Icon name="heroicons:chart-bar" class="w-5 h-5" />
          {{ $t('admin.nav.usage') }}
        </NuxtLink>

        <div class="pt-4 pb-2">
          <p class="px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">{{ $t('admin.nav.systemManagement') }}</p>
        </div>

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
          :class="$route.path === '/admin/skills' ? 'bg-indigo text-white' : 'text-gray-700 hover:bg-gray-100'"
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

        <NuxtLink 
          to="/admin/admins" 
          class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors"
          :class="$route.path === '/admin/admins' ? 'bg-indigo text-white' : 'text-gray-700 hover:bg-gray-100'"
        >
          <Icon name="heroicons:shield-check" class="w-5 h-5" />
          {{ $t('admin.nav.admins') }}
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
          <NuxtLink 
            to="/chat" 
            class="text-sm text-indigo hover:text-indigo-dark transition-colors"
          >
            {{ $t('nav.chat') }}
          </NuxtLink>
          <span class="text-gray-300">|</span>
          <ClientOnly>
            <span class="text-sm text-gray-600">{{ user?.email }}</span>
            <template #fallback>
              <span class="text-sm text-gray-600">...</span>
            </template>
          </ClientOnly>
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
  if (path === '/admin/services') return t('admin.services.title')
  if (path === '/admin/users') return t('admin.users.title')
  if (path.startsWith('/admin/users/')) return t('admin.users.userDetail')
  if (path === '/admin/orders') return t('admin.orders.title')
  if (path.startsWith('/admin/orders/')) return t('admin.orders.orderDetail')
  if (path === '/admin/transactions') return t('admin.transactions.title')
  if (path === '/admin/usage') return t('admin.usage.title')
  if (path === '/admin/admins') return t('admin.admins.title')
  return 'Admin'
})

const handleLogout = async () => {
  await auth.logout()
  router.push('/login')
}
</script>
