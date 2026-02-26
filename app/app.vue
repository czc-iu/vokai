<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const auth = useAuth()

onMounted(async () => {
  await auth.fetchUser()
})
</script>
