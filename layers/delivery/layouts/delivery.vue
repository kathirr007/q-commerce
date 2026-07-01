<template>
  <div class="flex min-h-screen bg-gray-50 dark:bg-gray-950">
    <aside class="w-64 border-r border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <NuxtLink to="/delivery" class="mb-6 flex items-center gap-2 text-xl font-bold text-emerald-600">
        <UIcon name="lucide:truck" class="h-6 w-6" />
        Delivery
      </NuxtLink>
      <nav class="space-y-1">
        <NuxtLink to="/delivery" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          :class="route.path === '/delivery' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : ''">
          <UIcon name="lucide:list" class="h-5 w-5" />
          Active Deliveries
        </NuxtLink>
        <NuxtLink to="/delivery/history" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          :class="route.path === '/delivery/history' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : ''">
          <UIcon name="lucide:clock" class="h-5 w-5" />
          History
        </NuxtLink>
      </nav>
    </aside>
    <div class="flex-1">
      <header class="flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
        <h2 class="text-lg font-semibold">Delivery Portal</h2>
        <div class="flex items-center gap-3">
          <UBadge :color="isOnline ? 'success' : 'neutral'" size="sm">{{ isOnline ? 'Online' : 'Offline' }}</UBadge>
          <UButton :color="isOnline ? 'neutral' : 'success'" size="sm" @click="toggleStatus">
            {{ isOnline ? 'Go Offline' : 'Go Online' }}
          </UButton>
        </div>
      </header>
      <main class="p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const isOnline = ref(false)

onMounted(async () => {
  const { data } = await (supabase as any)
    .from('delivery_partners')
    .select('status')
    .eq('user_id', user.value?.id)
    .single()
  if (data) isOnline.value = data.status === 'online'
})

async function toggleStatus() {
  isOnline.value = !isOnline.value
  await (supabase as any)
    .from('delivery_partners')
    .update({ status: isOnline.value ? 'online' : 'offline' })
    .eq('user_id', user.value?.id)
}
</script>
