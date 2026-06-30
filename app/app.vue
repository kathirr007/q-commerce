<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: '%s | QCommerce',
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  bodyAttrs: {
    class: 'min-h-screen bg-gray-50 dark:bg-gray-950'
  }
})
</script>
