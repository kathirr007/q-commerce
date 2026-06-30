<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="mb-8 text-3xl font-bold">Delivery Partner Portal</h1>

    <div class="mb-6 flex items-center gap-4">
      <UBadge :color="isOnline ? 'success' : 'neutral'" size="lg">
        {{ isOnline ? 'Online' : 'Offline' }}
      </UBadge>
      <UButton :color="isOnline ? 'neutral' : 'success'" @click="toggleStatus">
        {{ isOnline ? 'Go Offline' : 'Go Online' }}
      </UButton>
    </div>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Current Deliveries</h2>
      </template>
      <p class="text-gray-500">No active deliveries.</p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

useSeoMeta({ title: 'Delivery Portal' })

const isOnline = ref(false)

async function toggleStatus() {
  isOnline.value = !isOnline.value
  const supabase = useSupabaseClient()
  await (supabase as any)
    .from('delivery_partners')
    .update({ status: isOnline.value ? 'online' : 'offline' })
    .eq('user_id', useSupabaseUser().value?.id)
}
</script>
