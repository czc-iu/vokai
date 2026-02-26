<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center section-padding">
    <div class="text-center max-w-lg">
      <div class="relative mb-8">
        <div class="w-24 h-24 bg-sakura rounded-lg mx-auto flex items-center justify-center animate-float">
          <Icon name="heroicons:sparkles" class="w-12 h-12 text-indigo" />
        </div>
        <div class="absolute -top-2 -right-2 w-8 h-8 bg-matcha rounded-full flex items-center justify-center">
          <Icon name="heroicons:clock" class="w-4 h-4 text-white" />
        </div>
      </div>

      <h1 class="text-3xl md:text-4xl font-medium text-charcoal tracking-wide mb-4">
        敬请期待
      </h1>
      
      <p class="text-stone mb-8 leading-relaxed">
        此功能正在精心开发中，很快就会与您见面。<br>
        感谢您的耐心等待！
      </p>

      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <NuxtLink to="/" class="btn-primary">
          返回首页
        </NuxtLink>
        <NuxtLink to="/contact" class="btn-outline">
          联系我们
        </NuxtLink>
      </div>

      <div class="mt-12 grid grid-cols-3 gap-4">
        <div class="p-4 bg-white rounded-sm border border-sakura">
          <div class="text-2xl font-medium text-indigo mb-1">7×24</div>
          <div class="text-xs text-stone">小时服务</div>
        </div>
        <div class="p-4 bg-white rounded-sm border border-sakura">
          <div class="text-2xl font-medium text-indigo mb-1">99.9%</div>
          <div class="text-xs text-stone">可用性</div>
        </div>
        <div class="p-4 bg-white rounded-sm border border-sakura">
          <div class="text-2xl font-medium text-indigo mb-1">&lt;1s</div>
          <div class="text-xs text-stone">响应时间</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

useHead({
  title: '敬请期待 - TomyBot'
})
</script>
