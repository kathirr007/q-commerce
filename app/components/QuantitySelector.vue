<template>
  <div class="flex items-center gap-2">
    <UButton color="neutral" variant="soft" size="xs" :disabled="quantity <= 1" @click="$emit('update', quantity - 1)">
      <UIcon name="lucide:minus" class="h-3 w-3" />
    </UButton>
    <span class="w-8 text-center text-sm font-medium">{{ quantity }}</span>
    <UButton color="neutral" variant="soft" size="xs" @click="$emit('update', quantity + 1)">
      <UIcon name="lucide:plus" class="h-3 w-3" />
    </UButton>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  quantity: number
}>()

defineEmits<{
  update: [value: number]
}>()
</script>
