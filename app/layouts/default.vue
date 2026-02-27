<template>
  <div class="min-h-screen bg-cream flex flex-col">
    <header class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <nav class="container-zen h-16 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-3 group">
          <span class="text-xl font-brand tracking-wider text-charcoal group-hover:text-indigo transition-colors duration-300">TOMYBOT</span>
        </NuxtLink>
        
        <div class="hidden md:flex items-center gap-8">
          <NuxtLink to="/" class="nav-link">{{ t('nav.home') }}</NuxtLink>
          <NuxtLink to="/services" class="nav-link">{{ t('nav.services') }}</NuxtLink>
          <NuxtLink to="/contact" class="nav-link">{{ t('nav.contact') }}</NuxtLink>
        </div>

        <div class="hidden md:flex items-center gap-4">
          <LanguageSwitcher />
          <ClientOnly>
            <template v-if="user">
              <NuxtLink to="/chat" class="btn-soft">{{ t('nav.chat') }}</NuxtLink>
              <div class="relative" ref="userMenuRef">
                <button
                  @click="userMenuOpen = !userMenuOpen"
                  class="w-9 h-9 rounded-full bg-indigo text-white flex items-center justify-center text-sm font-medium hover:bg-indigo-dark transition-colors"
                >
                  {{ userInitial }}
                </button>
                <Transition
                  enter-active-class="transition ease-out duration-100"
                  enter-from-class="transform opacity-0 scale-95"
                  enter-to-class="transform opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-75"
                  leave-from-class="transform opacity-100 scale-100"
                  leave-to-class="transform opacity-0 scale-95"
                >
                  <div
                    v-if="userMenuOpen"
                    class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-sakura py-1 z-50"
                  >
                    <div class="px-4 py-2 border-b border-sakura">
                      <p class="text-sm font-medium text-charcoal truncate">{{ user.name || user.email }}</p>
                      <p class="text-xs text-stone truncate">{{ user.email }}</p>
                    </div>
                    <NuxtLink to="/admin" @click="userMenuOpen = false" class="flex items-center gap-2 px-4 py-2 text-sm text-indigo hover:bg-sakura/30 transition-colors">
                      <Icon name="heroicons:cog-6-tooth" class="w-4 h-4" />
                      {{ t('nav.admin') }}
                    </NuxtLink>
                    <div class="border-t border-sakura my-1"></div>
                    <NuxtLink to="/account" @click="userMenuOpen = false" class="flex items-center gap-2 px-4 py-2 text-sm text-charcoal hover:bg-sakura/30 transition-colors">
                      <Icon name="heroicons:user" class="w-4 h-4" />
                      {{ t('nav.account') }}
                    </NuxtLink>
                    <NuxtLink to="/billing" @click="userMenuOpen = false" class="flex items-center gap-2 px-4 py-2 text-sm text-charcoal hover:bg-sakura/30 transition-colors">
                      <Icon name="heroicons:credit-card" class="w-4 h-4" />
                      {{ t('nav.billing') }}
                    </NuxtLink>
                    <NuxtLink to="/orders" @click="userMenuOpen = false" class="flex items-center gap-2 px-4 py-2 text-sm text-charcoal hover:bg-sakura/30 transition-colors">
                      <Icon name="heroicons:document-text" class="w-4 h-4" />
                      {{ t('nav.orders') }}
                    </NuxtLink>
                    <NuxtLink to="/cart" @click="userMenuOpen = false" class="flex items-center gap-2 px-4 py-2 text-sm text-charcoal hover:bg-sakura/30 transition-colors">
                      <Icon name="heroicons:shopping-cart" class="w-4 h-4" />
                      {{ t('nav.cart') }}
                    </NuxtLink>
                    <NuxtLink to="/knowledge-base" @click="userMenuOpen = false" class="flex items-center gap-2 px-4 py-2 text-sm text-charcoal hover:bg-sakura/30 transition-colors">
                      <Icon name="heroicons:book-open" class="w-4 h-4" />
                      {{ t('nav.knowledgeBase') }}
                    </NuxtLink>
                    <NuxtLink to="/account#embed" @click="userMenuOpen = false" class="flex items-center gap-2 px-4 py-2 text-sm text-charcoal hover:bg-sakura/30 transition-colors">
                      <Icon name="heroicons:code-bracket" class="w-4 h-4" />
                      {{ t('nav.embedSDK') }}
                    </NuxtLink>
                    <div class="border-t border-sakura my-1"></div>
                    <button @click="handleLogout" class="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <Icon name="heroicons:arrow-right-on-rectangle" class="w-4 h-4" />
                      {{ t('nav.logout') }}
                    </button>
                  </div>
                </Transition>
              </div>
            </template>
            <template v-else>
              <NuxtLink to="/login" class="btn-outline text-sm px-6 py-2">{{ t('nav.login') }}</NuxtLink>
              <NuxtLink to="/register" class="btn-primary text-sm px-6 py-2">{{ t('nav.register') }}</NuxtLink>
            </template>
            <template #fallback>
              <NuxtLink to="/login" class="btn-outline text-sm px-6 py-2">{{ t('nav.login') }}</NuxtLink>
              <NuxtLink to="/register" class="btn-primary text-sm px-6 py-2">{{ t('nav.register') }}</NuxtLink>
            </template>
          </ClientOnly>
        </div>

        <button 
          @click="mobileMenuOpen = !mobileMenuOpen" 
          class="md:hidden p-2 text-charcoal"
        >
          <Icon :name="mobileMenuOpen ? 'heroicons:x-mark' : 'heroicons:bars-3'" class="w-6 h-6" />
        </button>
      </nav>

      <div 
        v-if="mobileMenuOpen" 
        class="md:hidden border-t border-gray-100 bg-white px-6 py-4"
      >
        <div class="flex flex-col gap-4">
          <NuxtLink to="/" class="py-2 text-charcoal" @click="mobileMenuOpen = false">{{ t('nav.home') }}</NuxtLink>
          <NuxtLink to="/services" class="py-2 text-charcoal" @click="mobileMenuOpen = false">{{ t('nav.services') }}</NuxtLink>
          <NuxtLink to="/contact" class="py-2 text-charcoal" @click="mobileMenuOpen = false">{{ t('nav.contact') }}</NuxtLink>
          <div class="py-2">
            <LanguageSwitcher />
          </div>
          <div class="flex gap-4 pt-4 border-t border-sakura">
            <ClientOnly>
              <template v-if="user">
                <NuxtLink to="/chat" class="btn-soft flex-1 text-center" @click="mobileMenuOpen = false">{{ t('nav.chat') }}</NuxtLink>
                <NuxtLink to="/account" class="btn-outline flex-1 text-center" @click="mobileMenuOpen = false">{{ t('nav.account') }}</NuxtLink>
                <button @click="handleLogout" class="btn-outline flex-1 text-red-600">{{ t('nav.logout') }}</button>
              </template>
              <template v-else>
                <NuxtLink to="/login" class="btn-outline flex-1 text-center text-sm" @click="mobileMenuOpen = false">{{ t('nav.login') }}</NuxtLink>
                <NuxtLink to="/register" class="btn-primary flex-1 text-center text-sm" @click="mobileMenuOpen = false">{{ t('nav.register') }}</NuxtLink>
              </template>
              <template #fallback>
                <NuxtLink to="/login" class="btn-outline flex-1 text-center text-sm" @click="mobileMenuOpen = false">{{ t('nav.login') }}</NuxtLink>
                <NuxtLink to="/register" class="btn-primary flex-1 text-center text-sm" @click="mobileMenuOpen = false">{{ t('nav.register') }}</NuxtLink>
              </template>
            </ClientOnly>
          </div>
          <ClientOnly>
            <template v-if="user">
              <div class="flex flex-col gap-2 pt-4 border-t border-sakura">
                <NuxtLink to="/admin" class="py-2 text-indigo text-sm font-medium" @click="mobileMenuOpen = false">{{ t('nav.admin') }}</NuxtLink>
                <NuxtLink to="/billing" class="py-2 text-charcoal text-sm" @click="mobileMenuOpen = false">{{ t('nav.billing') }}</NuxtLink>
                <NuxtLink to="/orders" class="py-2 text-charcoal text-sm" @click="mobileMenuOpen = false">{{ t('nav.orders') }}</NuxtLink>
                <NuxtLink to="/cart" class="py-2 text-charcoal text-sm" @click="mobileMenuOpen = false">{{ t('nav.cart') }}</NuxtLink>
                <NuxtLink to="/knowledge-base" class="py-2 text-charcoal text-sm" @click="mobileMenuOpen = false">{{ t('nav.knowledgeBase') }}</NuxtLink>
                <NuxtLink to="/account#embed" class="py-2 text-charcoal text-sm" @click="mobileMenuOpen = false">{{ t('nav.embedSDK') }}</NuxtLink>
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>
    </header>

    <main class="flex-1 pt-16">
      <slot />
    </main>

    <footer v-if="!isChatPage" class="bg-ink text-sakura/70 py-12">
      <div class="container-zen">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div class="md:col-span-2">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-indigo rounded-sm flex items-center justify-center">
                <Icon name="heroicons:chat-bubble-left-right" class="w-5 h-5 text-white" />
              </div>
              <span class="text-xl font-medium tracking-wide text-white">TomyBot</span>
            </div>
            <p class="text-sm leading-relaxed max-w-md">
              {{ t('footer.description') }}
            </p>
          </div>
          
          <div>
            <h4 class="text-white font-medium mb-4">{{ t('footer.product') }}</h4>
            <ul class="space-y-2 text-sm">
              <li><NuxtLink to="/services" class="hover:text-white transition-colors">{{ t('nav.services') }}</NuxtLink></li>
              <li><NuxtLink to="/coming-soon" class="hover:text-white transition-colors">{{ t('footer.features') }}</NuxtLink></li>
              <li><NuxtLink to="/coming-soon" class="hover:text-white transition-colors">{{ t('footer.cases') }}</NuxtLink></li>
            </ul>
          </div>
          
          <div>
            <h4 class="text-white font-medium mb-4">{{ t('footer.support') }}</h4>
            <ul class="space-y-2 text-sm">
              <li><NuxtLink to="/contact" class="hover:text-white transition-colors">{{ t('nav.contact') }}</NuxtLink></li>
              <li><NuxtLink to="/coming-soon" class="hover:text-white transition-colors">{{ t('footer.helpCenter') }}</NuxtLink></li>
              <li><NuxtLink to="/coming-soon" class="hover:text-white transition-colors">{{ t('footer.apiDocs') }}</NuxtLink></li>
            </ul>
          </div>
        </div>
        
        <div class="border-t border-white/10 pt-8">
          <div class="flex flex-col md:flex-row justify-between items-start gap-6">
            <div class="flex flex-col gap-3">
              <p class="text-xs text-sakura/50">
                {{ t('footer.copyright') }}
              </p>
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs text-sakura/40">
                <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors">
                  {{ t('footer.icp') }}
                </a>
                <span class="hidden sm:inline">|</span>
                <a href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1 hover:text-white transition-colors">
                  <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAABcElEQVQ4y6WUzUrDQBSFv0mbtP5QRBQXLgQXIoIbwYUP4MIHMK58BFdu3PgIPoYbN4JP4EJwIYIIIogLQRQRxFqN/dNMZtxM0qQmVvDCYYY7c+6Zey8DUBsJCqmNBC0NQAcQA6IJ/5jdCv1hQMwTfgcI/Qk08kfvVugPIlYCkv4hqY0Eq5+AS6B7k/p7wA5Q+QDkHpD5AOQekPkA5B6Q+QDkHpD5AOQekPkA5B6Q+QDkHpD5AOQekPkA5B6Q+QDkHpD5AOQekPkA5B6Q+QDkHpD5AOQekPkA5B6Q+QDkHpD5AOQekPkA5B6Q+QDkHpD5AOQekPkA5B6Q+QDkHpD5AOQekPkA5B6Q+QDkHpD5AOQekPkA5B6Q+QDkHpD5AOQekPkA5B6Q+QDkHpD5AOQekPkA5B6Q+QDkHpD5AOQekPkA5B6Q+QDkHpD5AOQekPkA5B6Q+QDkHpD5AOQekPkA5B6Q+QDkHpD5AOQekPkA5B6Q+QDkHpD5AOQekPkA5B6Q+QDkHpD5AOQekPkA5B6Q+QDkHpD5AOQekPkA5B6Q+QDkHpD5AOQekPkA5B6Q+QDkHpD5AOQekPkA5B6Q+QDkHpD5AOQeSP4C/RdnkNgN/AMfAAAAAElFTkSuQmCC" alt="公安备案" class="w-4 h-4" />
                  {{ t('footer.police') }}
                </a>
              </div>
            </div>
            <div class="flex gap-4">
              <NuxtLink to="/privacy" class="text-xs hover:text-white transition-colors">{{ t('footer.privacy') }}</NuxtLink>
              <NuxtLink to="/terms" class="text-xs hover:text-white transition-colors">{{ t('footer.terms') }}</NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const mobileMenuOpen = ref(false)
const userMenuOpen = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)
const user = useUser()

const isChatPage = computed(() => route.path === '/chat')

const userInitial = computed(() => {
  if (!user.value) return '?'
  const name = user.value.name || user.value.email
  return name.charAt(0).toUpperCase()
})

const handleClickOutside = (event: MouseEvent) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    userMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleLogout = async () => {
  await useAuth().logout()
  mobileMenuOpen.value = false
  userMenuOpen.value = false
  navigateTo('/')
}
</script>

<style scoped>
.nav-link {
  @apply text-charcoal/80 hover:text-charcoal transition-colors duration-200 text-sm tracking-wide relative font-medium;
}

.nav-link::after {
  content: '';
  @apply absolute -bottom-1 left-0 w-0 h-px bg-indigo transition-all duration-200;
}

.nav-link:hover::after {
  @apply w-full;
}
</style>
