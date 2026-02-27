<template>
  <div class="relative" ref="dropdownRef">
    <button
      @click="isOpen = !isOpen"
      class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sakura/50 transition-colors"
    >
      <Icon name="heroicons:language" class="w-5 h-5 text-charcoal" />
      <span class="text-sm text-charcoal hidden sm:inline">{{ currentLanguageName }}</span>
      <Icon 
        name="heroicons:chevron-down" 
        class="w-4 h-4 text-stone transition-transform"
        :class="{ 'rotate-180': isOpen }"
      />
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
        v-if="isOpen"
        class="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-sakura py-1 z-50"
      >
        <button
          v-for="locale in availableLocales"
          :key="locale.code"
          @click="changeLanguage(locale.code)"
          class="w-full px-4 py-2 text-left text-sm hover:bg-sakura/30 transition-colors flex items-center justify-between"
          :class="{ 'bg-sakura/50 text-indigo': locale.code === currentLocale }"
        >
          <span>{{ locale.name }}</span>
          <Icon 
            v-if="locale.code === currentLocale"
            name="heroicons:check" 
            class="w-4 h-4 text-indigo" 
          />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const currentLocale = computed(() => locale.value)

type LocaleCode = 'zh' | 'en' | 'ja'

interface LocaleInfo {
  code: LocaleCode
  name: string
}

const availableLocales = computed(() => {
  return locales.value.filter((l): l is LocaleInfo => 
    typeof l === 'object' && 'code' in l && 'name' in l
  )
})

const currentLanguageName = computed(() => {
  const current = availableLocales.value.find(l => l.code === currentLocale.value)
  return current?.name || '中文'
})

const changeLanguage = async (code: string) => {
  await setLocale(code as LocaleCode)
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
