<template>
  <div>
    <section class="min-h-[calc(100vh-4rem)] flex items-center justify-center relative overflow-hidden">
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-20 left-10 w-64 h-64 bg-sakura/30 rounded-full blur-3xl animate-float"></div>
        <div class="absolute bottom-20 right-10 w-80 h-80 bg-sky/20 rounded-full blur-3xl animate-float" style="animation-delay: -3s;"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-matcha/10 rounded-full blur-3xl"></div>
      </div>

      <div class="container-zen relative z-10">
        <div class="text-center max-w-3xl mx-auto">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-sakura/50 rounded-full mb-8 animate-pulse-soft">
            <Icon name="heroicons:building-office-2" class="w-4 h-4 text-indigo" />
            <span class="text-sm text-charcoal tracking-wide">{{ $t('home.banner') }}</span>
          </div>

          <div class="mb-8">
            <div class="inline-flex items-center justify-center w-24 h-24 bg-indigo rounded-lg mb-6 shadow-zen-lg animate-float">
              <Icon name="heroicons:chat-bubble-left-right" class="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 class="text-4xl md:text-5xl lg:text-6xl font-medium tracking-zen text-charcoal mb-6">
            {{ $t('home.hero.title') }}
            <span class="block text-2xl md:text-3xl lg:text-4xl mt-2 text-stone font-normal">
              {{ $t('home.hero.subtitle') }}
            </span>
          </h1>

          <p class="text-lg md:text-xl text-stone text-zen mb-10 max-w-xl mx-auto leading-relaxed">
            {{ $t('home.hero.description') }}
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <NuxtLink to="/register" class="btn-primary">
              {{ $t('home.hero.cta') }}
            </NuxtLink>
            <NuxtLink to="/contact" class="btn-outline">
              {{ $t('home.hero.contact') }}
            </NuxtLink>
          </div>

          <div class="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div class="text-center">
              <div class="w-12 h-12 bg-sakura rounded-sm mx-auto mb-3 flex items-center justify-center">
                <Icon name="heroicons:clock" class="w-6 h-6 text-indigo" />
              </div>
              <p class="text-xs text-stone tracking-wide">{{ $t('home.stats.hours') }}</p>
            </div>
            <div class="text-center">
              <div class="w-12 h-12 bg-sakura rounded-sm mx-auto mb-3 flex items-center justify-center">
                <Icon name="heroicons:bolt" class="w-6 h-6 text-indigo" />
              </div>
              <p class="text-xs text-stone tracking-wide">{{ $t('home.stats.response') }}</p>
            </div>
            <div class="text-center">
              <div class="w-12 h-12 bg-sakura rounded-sm mx-auto mb-3 flex items-center justify-center">
                <Icon name="heroicons:shield-check" class="w-6 h-6 text-indigo" />
              </div>
              <p class="text-xs text-stone tracking-wide">{{ $t('home.stats.security') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-padding bg-white">
      <div class="container-zen">
        <div class="text-center mb-16">
          <span class="inline-block text-xs text-stone tracking-widest uppercase mb-4">{{ $t('home.features.subtitle') }}</span>
          <h2 class="text-2xl md:text-3xl font-medium text-charcoal tracking-wide">{{ $t('home.features.title') }}</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div v-for="feature in features" :key="feature.title" class="card-zen p-6">
            <div class="w-12 h-12 bg-sakura rounded-sm flex items-center justify-center mb-4">
              <Icon :name="feature.icon" class="w-6 h-6 text-indigo" />
            </div>
            <h3 class="text-lg font-medium text-charcoal mb-2">{{ feature.title }}</h3>
            <p class="text-sm text-stone leading-relaxed">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section-padding bg-gradient-to-b from-sakura/20 to-cream">
      <div class="container-zen">
        <div class="text-center mb-16">
          <span class="inline-block text-xs text-stone tracking-widest uppercase mb-4">{{ $t('home.highlights.subtitle') }}</span>
          <h2 class="text-2xl md:text-3xl font-medium text-charcoal tracking-wide">{{ $t('home.highlights.title') }}</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="bg-white rounded-xl p-8 shadow-zen-md">
            <div class="flex items-start gap-4">
              <div class="w-14 h-14 bg-indigo/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="heroicons:document-text" class="w-7 h-7 text-indigo" />
              </div>
              <div>
                <h3 class="text-xl font-medium text-charcoal mb-3">{{ $t('home.highlights.knowledge.title') }}</h3>
                <p class="text-stone text-sm leading-relaxed mb-4">
                  {{ $t('home.highlights.knowledge.description') }}
                </p>
                <ul class="space-y-2 text-sm text-stone">
                  <li v-for="(item, index) in knowledgeFeatures" :key="index" class="flex items-center gap-2">
                    <Icon name="heroicons:check-circle" class="w-4 h-4 text-matcha" />
                    {{ item }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl p-8 shadow-zen-md">
            <div class="flex items-start gap-4">
              <div class="w-14 h-14 bg-indigo/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="heroicons:globe-alt" class="w-7 h-7 text-indigo" />
              </div>
              <div>
                <h3 class="text-xl font-medium text-charcoal mb-3">{{ $t('home.highlights.webSearch.title') }}</h3>
                <p class="text-stone text-sm leading-relaxed mb-4">
                  {{ $t('home.highlights.webSearch.description') }}
                </p>
                <ul class="space-y-2 text-sm text-stone">
                  <li v-for="(item, index) in webSearchFeatures" :key="index" class="flex items-center gap-2">
                    <Icon name="heroicons:check-circle" class="w-4 h-4 text-matcha" />
                    {{ item }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl p-8 shadow-zen-md">
            <div class="flex items-start gap-4">
              <div class="w-14 h-14 bg-indigo/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="heroicons:code-bracket" class="w-7 h-7 text-indigo" />
              </div>
              <div>
                <h3 class="text-xl font-medium text-charcoal mb-3">{{ $t('home.highlights.embed.title') }}</h3>
                <p class="text-stone text-sm leading-relaxed mb-4">
                  {{ $t('home.highlights.embed.description') }}
                </p>
                <ul class="space-y-2 text-sm text-stone">
                  <li v-for="(item, index) in embedFeatures" :key="index" class="flex items-center gap-2">
                    <Icon name="heroicons:check-circle" class="w-4 h-4 text-matcha" />
                    {{ item }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl p-8 shadow-zen-md">
            <div class="flex items-start gap-4">
              <div class="w-14 h-14 bg-indigo/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="heroicons:cpu-chip" class="w-7 h-7 text-indigo" />
              </div>
              <div>
                <h3 class="text-xl font-medium text-charcoal mb-3">{{ $t('home.highlights.memory.title') }}</h3>
                <p class="text-stone text-sm leading-relaxed mb-4">
                  {{ $t('home.highlights.memory.description') }}
                </p>
                <ul class="space-y-2 text-sm text-stone">
                  <li v-for="(item, index) in memoryFeatures" :key="index" class="flex items-center gap-2">
                    <Icon name="heroicons:check-circle" class="w-4 h-4 text-matcha" />
                    {{ item }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-padding">
      <div class="container-zen">
        <div class="max-w-2xl mx-auto text-center">
          <span class="inline-block text-xs text-stone tracking-widest uppercase mb-4">{{ $t('home.contact.subtitle') }}</span>
          <h2 class="text-2xl md:text-3xl font-medium text-charcoal tracking-wide mb-4">{{ $t('home.contact.title') }}</h2>
          <p class="text-stone mb-8">{{ $t('home.contact.description') }}</p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="mailto:info@sayco.com.cn" class="inline-flex items-center gap-2 text-indigo hover:text-charcoal transition-colors">
              <Icon name="heroicons:envelope" class="w-5 h-5" />
              <span>info@sayco.com.cn</span>
            </a>
            <span class="hidden sm:block text-sand">|</span>
            <NuxtLink to="/contact" class="btn-soft text-sm">
              {{ $t('home.contact.onlineMessage') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

useHead({
  title: () => t('home.title'),
  meta: [
    { name: 'description', content: () => t('home.description') }
  ]
})

const features = computed(() => [
  {
    icon: 'heroicons:chat-bubble-left-right',
    title: $t('home.features.items.chat.title'),
    description: $t('home.features.items.chat.description')
  },
  {
    icon: 'heroicons:document-text',
    title: $t('home.features.items.knowledge.title'),
    description: $t('home.features.items.knowledge.description')
  },
  {
    icon: 'heroicons:globe-alt',
    title: $t('home.features.items.search.title'),
    description: $t('home.features.items.search.description')
  },
  {
    icon: 'heroicons:code-bracket',
    title: $t('home.features.items.embed.title'),
    description: $t('home.features.items.embed.description')
  },
  {
    icon: 'heroicons:cpu-chip',
    title: $t('home.features.items.memory.title'),
    description: $t('home.features.items.memory.description')
  },
  {
    icon: 'heroicons:chart-bar',
    title: $t('home.features.items.analytics.title'),
    description: $t('home.features.items.analytics.description')
  }
])

const knowledgeFeatures = computed(() => [
  $t('home.highlights.knowledge.features.0'),
  $t('home.highlights.knowledge.features.1'),
  $t('home.highlights.knowledge.features.2')
])

const webSearchFeatures = computed(() => [
  $t('home.highlights.webSearch.features.0'),
  $t('home.highlights.webSearch.features.1'),
  $t('home.highlights.webSearch.features.2')
])

const embedFeatures = computed(() => [
  $t('home.highlights.embed.features.0'),
  $t('home.highlights.embed.features.1'),
  $t('home.highlights.embed.features.2')
])

const memoryFeatures = computed(() => [
  $t('home.highlights.memory.features.0'),
  $t('home.highlights.memory.features.1'),
  $t('home.highlights.memory.features.2')
])
</script>
