<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="mb-8 text-3xl font-bold">Stores Near You</h1>

    <div class="mb-8">
      <StoreMap :stores="stores" />
    </div>

    <div v-if="loading" class="py-12 text-center text-gray-500">
      Loading stores...
    </div>

    <div v-else-if="stores.length === 0" class="py-12 text-center text-gray-500">
      No stores available.
    </div>

    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <StoreCard v-for="store in stores" :key="store.id" :store="store" />
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Stores' })

const stores = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  const { data, error } = await useFetch('/api/stores')
  if (data.value) stores.value = data.value as any[]
  loading.value = false
})
</script>
