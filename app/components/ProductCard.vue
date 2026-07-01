<template>
  <UCard>
    <div class="aspect-square mb-3 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
      <UIcon name="lucide:package" class="h-12 w-12 text-gray-400" />
    </div>
    <h3 class="font-semibold">{{ product.name }}</h3>
    <p class="mb-2 text-sm text-gray-500">{{ product.description }}</p>
    <div class="flex items-center justify-between">
      <span class="text-lg font-bold text-emerald-600">₹{{ product.price }}</span>
      <UButton color="success" size="sm" @click="$emit('add', product)">
        Add to Cart
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  product: any
}>()

defineEmits<{
  add: [product: any]
}>()
</script>
