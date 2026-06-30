<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="mb-8 text-3xl font-bold">Admin Dashboard</h1>

    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <UCard v-for="stat in stats" :key="stat.label">
        <div class="text-2xl font-bold text-emerald-600">{{ stat.value }}</div>
        <div class="text-sm text-gray-500">{{ stat.label }}</div>
      </UCard>
    </div>

    <div class="mt-8 grid gap-6 md:grid-cols-2">
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Recent Orders</h2>
        </template>
        <p class="text-gray-500">Order list will appear here.</p>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Store Overview</h2>
        </template>
        <p class="text-gray-500">Store management will appear here.</p>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

useSeoMeta({ title: 'Admin Dashboard' })

const stats = [
  { label: 'Total Orders', value: '0' },
  { label: 'Active Stores', value: '0' },
  { label: 'Delivery Partners', value: '0' },
  { label: 'Revenue Today', value: '₹0' }
]
</script>
