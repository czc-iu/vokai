<template>
  <div class="min-h-[calc(100vh-4rem)] py-8">
    <div class="container-zen max-w-4xl">
      <h1 class="text-3xl font-medium text-charcoal mb-8">{{ $t('terms.heading') }}</h1>
      
      <div class="bg-white rounded-lg border border-sakura p-8 prose max-w-none">
        <p class="text-stone text-sm mb-6">{{ $t('terms.lastUpdated') }}</p>

        <h2>{{ $t('terms.content.intro').split('。')[0].split('，')[0] }}</h2>
        <p>{{ $t('terms.content.intro') }}</p>
        <p>{{ $t('terms.content.acceptance') }}</p>

        <h2>{{ $t('terms.content.sections.service.title') }}</h2>
        
        <h3>{{ $t('terms.content.sections.service.description.title') }}</h3>
        <p>{{ $t('terms.content.sections.service.description.intro') }}</p>
        <ul>
          <li v-for="(item, index) in $tm('terms.content.sections.service.description.items')" :key="index">{{ item }}</li>
        </ul>

        <h3>{{ $t('terms.content.sections.service.changes.title') }}</h3>
        <p>{{ $t('terms.content.sections.service.changes.description') }}</p>

        <h2>{{ $t('terms.content.sections.account.title') }}</h2>
        
        <h3>{{ $t('terms.content.sections.account.registration.title') }}</h3>
        <ul>
          <li v-for="(item, index) in $tm('terms.content.sections.account.registration.items')" :key="index">{{ item }}</li>
        </ul>

        <h3>{{ $t('terms.content.sections.account.security.title') }}</h3>
        <ul>
          <li v-for="(item, index) in $tm('terms.content.sections.account.security.items')" :key="index">{{ item }}</li>
        </ul>

        <h2>{{ $t('terms.content.sections.billing.title') }}</h2>
        
        <h3>{{ $t('terms.content.sections.billing.description.title') }}</h3>
        <p>{{ $t('terms.content.sections.billing.description.intro') }}</p>
        <ul>
          <li v-for="(item, index) in $tm('terms.content.sections.billing.description.items')" :key="index">{{ item }}</li>
        </ul>

        <h3>{{ $t('terms.content.sections.billing.method.title') }}</h3>
        <ul>
          <li v-for="(item, index) in $tm('terms.content.sections.billing.method.items')" :key="index">{{ item }}</li>
        </ul>

        <h3>{{ $t('terms.content.sections.billing.validity.title') }}</h3>
        <ul>
          <li v-for="(item, index) in $tm('terms.content.sections.billing.validity.items')" :key="index">{{ item }}</li>
        </ul>

        <h2>{{ $t('terms.content.sections.conduct.title') }}</h2>
        
        <h3>{{ $t('terms.content.sections.conduct.prohibited.title') }}</h3>
        <p>{{ $t('terms.content.sections.conduct.prohibited.description') }}</p>
        <ul>
          <li v-for="(item, index) in $tm('terms.content.sections.conduct.prohibited.items')" :key="index">{{ item }}</li>
        </ul>

        <h3>{{ $t('terms.content.sections.conduct.responsibility.title') }}</h3>
        <p>{{ $t('terms.content.sections.conduct.responsibility.description') }}</p>

        <h2>{{ $t('terms.content.sections.intellectualProperty.title') }}</h2>
        
        <h3>{{ $t('terms.content.sections.intellectualProperty.ours.title') }}</h3>
        <p>{{ $t('terms.content.sections.intellectualProperty.ours.description') }}</p>

        <h3>{{ $t('terms.content.sections.intellectualProperty.yours.title') }}</h3>
        <p>{{ $t('terms.content.sections.intellectualProperty.yours.description') }}</p>

        <h2>{{ $t('terms.content.sections.refund.title') }}</h2>
        <ul>
          <li v-for="(item, index) in $tm('terms.content.sections.refund.items')" :key="index">{{ item }}</li>
        </ul>

        <h2>{{ $t('terms.content.sections.disclaimer.title') }}</h2>
        
        <h3>{{ $t('terms.content.sections.disclaimer.interruption.title') }}</h3>
        <p>{{ $t('terms.content.sections.disclaimer.interruption.description') }}</p>
        <ul>
          <li v-for="(item, index) in $tm('terms.content.sections.disclaimer.interruption.items')" :key="index">{{ item }}</li>
        </ul>

        <h3>{{ $t('terms.content.sections.disclaimer.aiOutput.title') }}</h3>
        <p>{{ $t('terms.content.sections.disclaimer.aiOutput.description') }}</p>

        <h2>{{ $t('terms.content.sections.termination.title') }}</h2>
        
        <h3>{{ $t('terms.content.sections.termination.user.title') }}</h3>
        <p>{{ $t('terms.content.sections.termination.user.description') }}</p>

        <h3>{{ $t('terms.content.sections.termination.us.title') }}</h3>
        <p>{{ $t('terms.content.sections.termination.us.description') }}</p>

        <h2>{{ $t('terms.content.sections.modifications.title') }}</h2>
        <p>{{ $t('terms.content.sections.modifications.description') }}</p>

        <h2>{{ $t('terms.content.sections.disputes.title') }}</h2>
        <p>{{ $t('terms.content.sections.disputes.description') }}</p>

        <h2>{{ $t('terms.content.sections.other.title') }}</h2>
        <ul>
          <li v-for="(item, index) in $tm('terms.content.sections.other.items')" :key="index">{{ item }}</li>
        </ul>

        <h2>{{ $t('terms.content.sections.contact.title') }}</h2>
        <p>{{ $t('terms.content.sections.contact.description') }}</p>
        <ul>
          <li>{{ $t('contact.info.email') }}：<a href="mailto:info@sayco.com.cn">info@sayco.com.cn</a></li>
          <li>{{ $t('contact.info.company') }}：{{ $t('contact.info.companyName') }}</li>
        </ul>

        <p class="mt-8 text-stone text-sm">
          {{ $t('terms.content.company') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const { t } = useI18n()

useHead({
  title: t('terms.title')
})
</script>
