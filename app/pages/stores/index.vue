<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="mb-8 text-3xl font-bold">Stores Near You</h1>

    <div v-if="stores.length === 0" class="py-12 text-center text-gray-500">
      Loading stores...
    </div>

    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <UCard v-for="store in stores" :key="store.id">
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
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Stores' })

const supabase = useSupabaseClient()
const stores = ref<any[]>([])

onMounted(async () => {
  const { data } = await (supabase as any).from('stores').select('*')
  if (data) stores.value = data
})
</script>
