<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">{{ store.name }}</h3>
        <UBadge :color="store.status === 'active' ? 'success' : 'neutral'" variant="soft">
          {{ store.status }}
        </UBadge>
      </div>
    </template>
    <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
      {{ store.type === 'dark_store' ? 'Dark Store' : 'Retail Store' }}
    </p>
    <UButton :to="`/stores/${store.id}`" color="success" variant="outline" size="sm">
      View Products
    </UButton>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  store: any
}>()
</script>
