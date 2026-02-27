<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Notification />
</template>

<script setup lang="ts">
const auth = useAuth()

onMounted(async () => {
  await auth.fetchUser()
})
</script>
