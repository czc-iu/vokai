<template>
  <div>
    <!-- Hero 区域 -->
    <section class="min-h-screen flex items-center relative overflow-hidden bg-gradient-hero">
      <div class="container mx-auto max-w-[1200px] px-6 relative z-10 py-20 pt-[140px]">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div class="text-center lg:text-left">
            <span class="inline-block bg-indigo-100 text-indigo-600 px-5 py-2 rounded-full text-sm font-semibold mb-8">
              {{ $t('home.banner') }}
            </span>

            <h1 class="text-5xl md:text-6xl lg:text-[4rem] font-extrabold text-gray-900 mb-8 leading-tight">
              让客服更智能<br>
              <span class="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">让服务更高效</span>
            </h1>

            <p class="text-xl text-gray-600 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              TomyBot AI对话助手，7×24小时在线智能响应，为您提供售前咨询、产品推荐、售后支持及订单查询等一站式服务体验。
            </p>

            <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <NuxtLink to="/register" class="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer">
                {{ $t('home.hero.cta') }}
                <Icon name="heroicons:arrow-right" class="w-5 h-5 ml-2" />
              </NuxtLink>
              <NuxtLink to="/contact" class="inline-flex items-center justify-center px-8 py-4 bg-transparent text-indigo-600 rounded-lg font-semibold border-2 border-indigo-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer">
                {{ $t('home.hero.contact') }}
              </NuxtLink>
            </div>

            <!-- 特性标签 -->
            <div class="flex flex-wrap gap-8 justify-center lg:justify-start">
              <div class="flex items-center gap-3">
                <div class="w-6 h-6 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                <span class="text-gray-600 font-medium">智能对话</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-6 h-6 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                <span class="text-gray-600 font-medium">快速响应</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-6 h-6 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                <span class="text-gray-600 font-medium">数据安全</span>
              </div>
            </div>
          </div>

          <!-- 右侧聊天演示 -->
          <div class="hidden lg:block">
            <div class="bg-white rounded-xl shadow-xl p-8 max-w-md mx-auto">
              <div class="flex items-center gap-4 pb-6 border-b border-gray-100 mb-6">
                <div class="w-12 h-12 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full flex items-center justify-center text-white text-xl">
                  🤖
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 text-lg">TomyBot助手</h3>
                  <p class="text-gray-500 text-sm">{{ $t('home.demo.online') }} · 随时为您服务</p>
                </div>
              </div>
              <div class="space-y-4">
                <div class="bg-gray-50 rounded-lg p-4 max-w-[85%]">
                  <p class="text-gray-800 text-sm leading-relaxed">您好！我是TomyBot AI助手，有什么可以帮助您的吗？</p>
                </div>
                <div class="bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg p-4 max-w-[85%] ml-auto">
                  <p class="text-sm leading-relaxed">{{ $t('home.demo.user') }}</p>
                </div>
                <div class="bg-gray-50 rounded-lg p-4 max-w-[85%]">
                  <p class="text-gray-800 text-sm leading-relaxed">{{ $t('home.demo.ai') }}</p>
                </div>
              </div>
              <div class="flex gap-1 mt-4">
                <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0s;"></div>
                <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
                <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 核心功能 -->
    <section class="py-24 bg-white">
      <div class="container mx-auto max-w-[1200px] px-6">
        <div class="text-center mb-16">
          <span class="inline-block bg-indigo-100 text-indigo-600 px-5 py-2 rounded-full text-sm font-semibold mb-6">
            {{ $t('home.features.tag') }}
          </span>
          <h2 class="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">{{ $t('home.features.title') }}</h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">{{ $t('home.features.subtitle') }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div v-for="feature in coreFeatures" :key="feature.title" 
               class="group bg-white rounded-xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden">
            <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-violet-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            <div class="w-14 h-14 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center mb-6 text-white transition-transform group-hover:scale-110">
              <Icon :name="feature.icon" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">{{ feature.title }}</h3>
            <p class="text-gray-600 leading-relaxed">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 数据统计 -->
    <section class="py-24 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950">
      <!-- 装饰背景 -->
      <div class="absolute inset-0">
        <!-- 大型渐变圆形 -->
        <div class="absolute -top-20 -left-20 w-[500px] h-[500px] bg-gradient-radial from-indigo-500/30 to-transparent rounded-full blur-3xl"></div>
        <div class="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-gradient-radial from-violet-500/30 to-transparent rounded-full blur-3xl"></div>
        
        <!-- 中间光晕 -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-purple-500/20 to-transparent rounded-full blur-3xl"></div>
        
        <!-- 光线效果 -->
        <div class="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-indigo-400/20 to-transparent"></div>
        <div class="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-violet-400/20 to-transparent"></div>
      </div>
      
      <!-- 点阵纹理 -->
      <div class="absolute inset-0 opacity-30" style="background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0); background-size: 40px 40px;"></div>
      
      <div class="container mx-auto max-w-[1200px] px-6 relative z-10">
        <div class="text-center mb-16">
          <span class="inline-block bg-white/10 text-white/90 px-5 py-2 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm">
            {{ $t('home.stats.tag') }}
          </span>
          <h2 class="text-4xl md:text-5xl font-extrabold text-white mb-6">{{ $t('home.stats.title') }}</h2>
          <p class="text-xl text-white/70 max-w-2xl mx-auto">{{ $t('home.stats.subtitle') }}</p>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div v-for="stat in statsData" :key="stat.label" 
               class="group text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <div class="text-5xl md:text-6xl font-extrabold text-white mb-3 group-hover:scale-110 transition-transform">
              {{ stat.value }}
            </div>
            <div class="text-white/70 text-lg font-medium">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 产品优势 -->
    <section class="py-24 bg-gray-50">
      <div class="container mx-auto max-w-[1200px] px-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span class="inline-block bg-indigo-100 text-indigo-600 px-5 py-2 rounded-full text-sm font-semibold mb-6">
              {{ $t('home.advantages.tag') }}
            </span>
            <h2 class="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8">{{ $t('home.advantages.title') }}</h2>
            
            <div class="space-y-5">
              <div v-for="advantage in advantages" :key="advantage.title" 
                   class="flex gap-5 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer hover:translate-x-2">
                <div class="w-12 h-12 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center flex-shrink-0 text-white">
                  <Icon :name="advantage.icon" class="w-6 h-6" />
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 text-lg mb-2">{{ advantage.title }}</h4>
                  <p class="text-gray-600 leading-relaxed">{{ advantage.description }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="relative">
            <div class="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl p-8 relative overflow-hidden">
              <div class="relative z-10 space-y-6">
                <div class="bg-white/20 rounded-lg p-6">
                  <div class="flex justify-between items-center mb-3">
                    <span class="text-white font-semibold">问题解决率</span>
                    <span class="text-white font-bold text-lg">98.5%</span>
                  </div>
                  <div class="bg-white/30 h-2 rounded-full overflow-hidden">
                    <div class="bg-white h-full rounded-full" style="width: 98.5%;"></div>
                  </div>
                </div>
                <div class="bg-white/20 rounded-lg p-6">
                  <div class="flex justify-between items-center mb-3">
                    <span class="text-white font-semibold">响应速度</span>
                    <span class="text-white font-bold text-lg">1.2秒</span>
                  </div>
                  <div class="bg-white/30 h-2 rounded-full overflow-hidden">
                    <div class="bg-white h-full rounded-full" style="width: 95%;"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 应用场景 -->
    <section class="py-24 bg-gradient-to-b from-white to-indigo-50/50 relative overflow-hidden">
      <!-- 条纹装饰 -->
      <div class="absolute inset-0 opacity-[0.03]" style="background-image: repeating-linear-gradient(45deg, #6366f1 0, #6366f1 1px, transparent 0, transparent 50%); background-size: 20px 20px;"></div>
      
      <div class="container mx-auto max-w-[1200px] px-6 relative z-10">
        <div class="text-center mb-16">
          <span class="inline-block bg-indigo-100 text-indigo-600 px-5 py-2 rounded-full text-sm font-semibold mb-6">
            {{ $t('home.scenarios.tag') }}
          </span>
          <h2 class="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">{{ $t('home.scenarios.title') }}</h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">{{ $t('home.scenarios.subtitle') }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="scenario in scenarios" :key="scenario.title" 
               class="group bg-white rounded-xl overflow-hidden border border-indigo-50/50 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 cursor-pointer">
            <div class="aspect-[4/3] bg-gradient-to-br from-indigo-50/50 via-violet-50/50 to-indigo-100/50 flex items-center justify-center group-hover:from-indigo-100 group-hover:to-violet-100 transition-colors relative">
              <Icon :name="scenario.icon" class="w-16 h-16 text-indigo-300 group-hover:text-indigo-500 transition-colors" />
              <!-- 装饰元素 -->
              <div class="absolute top-4 right-4 w-12 h-12 bg-indigo-100/50 rounded-full blur-xl"></div>
              <div class="absolute bottom-4 left-4 w-8 h-8 bg-violet-100/50 rounded-full blur-xl"></div>
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-2">{{ scenario.title }}</h3>
              <p class="text-gray-600 leading-relaxed">{{ scenario.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-28 bg-gradient-to-b from-white to-indigo-50/30">
      <div class="container mx-auto max-w-[1200px] px-6">
        <div class="bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 rounded-3xl p-16 md:p-24 lg:p-28 text-center relative overflow-hidden shadow-2xl shadow-indigo-500/30">
          <!-- 装饰背景 -->
          <div class="absolute inset-0 overflow-hidden">
            <div class="absolute top-1/4 left-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
            <div class="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl"></div>
          </div>
          
          <div class="relative z-10 max-w-3xl mx-auto">
            <h2 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-8">{{ $t('home.cta.title') }}</h2>
            <p class="text-xl md:text-2xl text-white/90 mb-14 leading-relaxed">{{ $t('home.cta.subtitle') }}</p>
            <div class="flex flex-col sm:flex-row gap-5 justify-center">
              <NuxtLink to="/register" class="inline-flex items-center justify-center px-10 py-5 bg-white text-indigo-600 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                {{ $t('home.cta.button') }}
                <Icon name="heroicons:arrow-right" class="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </NuxtLink>
              <NuxtLink to="/contact" class="inline-flex items-center justify-center px-10 py-5 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-semibold text-lg border-2 border-white/30 hover:bg-white/20 hover:border-white/60 transition-all duration-300 cursor-pointer">
                {{ $t('home.cta.contact') }}
              </NuxtLink>
            </div>
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

const coreFeatures = computed(() => [
  {
    icon: 'heroicons:chat-bubble-left-right',
    title: t('home.features.items.chat.title'),
    description: t('home.features.items.chat.description')
  },
  {
    icon: 'heroicons:document-text',
    title: t('home.features.items.knowledge.title'),
    description: t('home.features.items.knowledge.description')
  },
  {
    icon: 'heroicons:globe-alt',
    title: t('home.features.items.search.title'),
    description: t('home.features.items.search.description')
  },
  {
    icon: 'heroicons:code-bracket',
    title: t('home.features.items.embed.title'),
    description: t('home.features.items.embed.description')
  }
])

const statsData = computed(() => [
  { value: '5000+', label: t('home.stats.companies') },
  { value: '100万+', label: t('home.stats.conversations') },
  { value: '99.9%', label: t('home.stats.availability') },
  { value: '<1s', label: t('home.stats.responseTime') }
])

const advantages = computed(() => [
  {
    icon: 'heroicons:bolt',
    title: t('home.advantages.items.fast.title'),
    description: t('home.advantages.items.fast.description')
  },
  {
    icon: 'heroicons:shield-check',
    title: t('home.advantages.items.secure.title'),
    description: t('home.advantages.items.secure.description')
  },
  {
    icon: 'heroicons:cpu-chip',
    title: t('home.advantages.items.smart.title'),
    description: t('home.advantages.items.smart.description')
  }
])

const scenarios = computed(() => [
  {
    icon: 'heroicons:building-storefront',
    title: t('home.scenarios.items.ecommerce.title'),
    description: t('home.scenarios.items.ecommerce.description')
  },
  {
    icon: 'heroicons:building-office',
    title: t('home.scenarios.items.enterprise.title'),
    description: t('home.scenarios.items.enterprise.description')
  },
  {
    icon: 'heroicons:academic-cap',
    title: t('home.scenarios.items.education.title'),
    description: t('home.scenarios.items.education.description')
  }
])
</script>

<style scoped>
.bg-gradient-hero {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 50%, #f5f3ff 100%);
}

.bg-gradient-radial {
  background: radial-gradient(circle, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 70%);
}
</style>
