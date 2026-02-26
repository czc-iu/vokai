<template>
  <div class="min-h-[calc(100vh-4rem)] py-8">
    <div class="container-zen max-w-4xl">
      <h1 class="text-3xl font-medium text-charcoal mb-8">{{ $t('privacy.heading') }}</h1>
      
      <div class="bg-white rounded-lg border border-sakura p-8 prose max-w-none">
        <p class="text-stone text-sm mb-6">{{ $t('privacy.lastUpdated') }}</p>

        <h2>{{ $t('privacy.content.intro').split('。')[0] }}</h2>
        <p>{{ $t('privacy.content.intro') }}</p>

        <h2>{{ $t('privacy.content.sections.collection.title') }}</h2>
        
        <h3>{{ $t('privacy.content.sections.collection.account.title') }}</h3>
        <p>{{ $t('privacy.content.sections.collection.account.description') }}</p>
        <ul>
          <li><strong>{{ $t('privacy.content.sections.collection.account.items.email').split('：')[0] }}</strong>：{{ $t('privacy.content.sections.collection.account.items.email').split('：')[1] }}</li>
          <li><strong>{{ $t('privacy.content.sections.collection.account.items.password').split('：')[0] }}</strong>：{{ $t('privacy.content.sections.collection.account.items.password').split('：')[1] }}</li>
          <li><strong>{{ $t('privacy.content.sections.collection.account.items.name').split('（')[0] }}</strong>（{{ $t('privacy.content.sections.collection.account.items.name').split('（')[1] }}</li>
          <li><strong>{{ $t('privacy.content.sections.collection.account.items.phone').split('（')[0] }}</strong>（{{ $t('privacy.content.sections.collection.account.items.phone').split('（')[1] }}</li>
        </ul>

        <h3>{{ $t('privacy.content.sections.collection.chat.title') }}</h3>
        <p>{{ $t('privacy.content.sections.collection.chat.description') }}</p>
        <ul>
          <li><strong>{{ $t('privacy.content.sections.collection.chat.items.conversations').split('：')[0] }}</strong>：{{ $t('privacy.content.sections.collection.chat.items.conversations').split('：')[1] }}</li>
          <li><strong>{{ $t('privacy.content.sections.collection.chat.items.memory').split('：')[0] }}</strong>：{{ $t('privacy.content.sections.collection.chat.items.memory').split('：')[1] }}</li>
          <li><strong>{{ $t('privacy.content.sections.collection.chat.items.knowledge').split('：')[0] }}</strong>：{{ $t('privacy.content.sections.collection.chat.items.knowledge').split('：')[1] }}</li>
        </ul>

        <h3>{{ $t('privacy.content.sections.collection.transaction.title') }}</h3>
        <p>{{ $t('privacy.content.sections.collection.transaction.description') }}</p>
        <ul>
          <li><strong>{{ $t('privacy.content.sections.collection.transaction.items.orders').split('：')[0] }}</strong>：{{ $t('privacy.content.sections.collection.transaction.items.orders').split('：')[1] }}</li>
          <li><strong>{{ $t('privacy.content.sections.collection.transaction.items.payment').split('：')[0] }}</strong>：{{ $t('privacy.content.sections.collection.transaction.items.payment').split('：')[1] }}</li>
        </ul>

        <h2>{{ $t('privacy.content.sections.usage.title') }}</h2>
        <ul>
          <li v-for="(item, index) in $tm('privacy.content.sections.usage.items')" :key="index">{{ item }}</li>
        </ul>

        <h2>{{ $t('privacy.content.sections.sharing.title') }}</h2>
        
        <h3>{{ $t('privacy.content.sections.sharing.share.title') }}</h3>
        <p>{{ $t('privacy.content.sections.sharing.share.description') }}</p>
        <ul>
          <li>{{ $t('privacy.content.sections.sharing.share.items[0]') }}</li>
          <li>{{ $t('privacy.content.sections.sharing.share.items[1]') }}</li>
          <li>{{ $t('privacy.content.sections.sharing.share.items[2]') }}</li>
        </ul>

        <h3>{{ $t('privacy.content.sections.sharing.transfer.title') }}</h3>
        <p>{{ $t('privacy.content.sections.sharing.transfer.description') }}</p>

        <h3>{{ $t('privacy.content.sections.sharing.disclosure.title') }}</h3>
        <p>{{ $t('privacy.content.sections.sharing.disclosure.description') }}</p>

        <h2>{{ $t('privacy.content.sections.rights.title') }}</h2>
        <ul>
          <li><strong>{{ $t('privacy.content.sections.rights.items.access').split('：')[0] }}</strong>：{{ $t('privacy.content.sections.rights.items.access').split('：')[1] }}</li>
          <li><strong>{{ $t('privacy.content.sections.rights.items.correct').split('：')[0] }}</strong>：{{ $t('privacy.content.sections.rights.items.correct').split('：')[1] }}</li>
          <li><strong>{{ $t('privacy.content.sections.rights.items.delete').split('：')[0] }}</strong>：{{ $t('privacy.content.sections.rights.items.delete').split('：')[1] }}</li>
          <li><strong>{{ $t('privacy.content.sections.rights.items.export').split('：')[0] }}</strong>：{{ $t('privacy.content.sections.rights.items.export').split('：')[1] }}</li>
          <li><strong>{{ $t('privacy.content.sections.rights.items.withdraw').split('：')[0] }}</strong>：{{ $t('privacy.content.sections.rights.items.withdraw').split('：')[1] }}</li>
        </ul>

        <h2>{{ $t('privacy.content.sections.security.title') }}</h2>
        <p>{{ $t('privacy.content.sections.security.description') }}</p>
        <ul>
          <li v-for="(item, index) in $tm('privacy.content.sections.security.items')" :key="index">{{ item }}</li>
        </ul>

        <h2>{{ $t('privacy.content.sections.cookie.title') }}</h2>
        <p>{{ $t('privacy.content.sections.cookie.description') }}</p>
        <ul>
          <li v-for="(item, index) in $tm('privacy.content.sections.cookie.items')" :key="index">{{ item }}</li>
        </ul>

        <h2>{{ $t('privacy.content.sections.minors.title') }}</h2>
        <p>{{ $t('privacy.content.sections.minors.description') }}</p>

        <h2>{{ $t('privacy.content.sections.updates.title') }}</h2>
        <p>{{ $t('privacy.content.sections.updates.description') }}</p>

        <h2>{{ $t('privacy.content.sections.contact.title') }}</h2>
        <p>{{ $t('privacy.content.sections.contact.description') }}</p>
        <ul>
          <li>{{ $t('contact.info.email') }}：<a href="mailto:info@sayco.com.cn">info@sayco.com.cn</a></li>
          <li>{{ $t('contact.info.company') }}：{{ $t('contact.info.companyName') }}</li>
        </ul>

        <p class="mt-8 text-stone text-sm">
          {{ $t('privacy.content.company') }}
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
  title: t('privacy.title')
})
</script>
