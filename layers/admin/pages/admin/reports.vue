<template>
  <div class="space-y-6">
    <div class="grid gap-6 md:grid-cols-5">
      <UCard v-for="stat in kpis" :key="stat.label">
        <div class="text-2xl font-bold text-emerald-600">{{ stat.value }}</div>
        <div class="text-sm text-gray-500">{{ stat.label }}</div>
      </UCard>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Orders by Status</h3>
        </template>
        <div v-if="analytics.ordersByStatus?.length" class="space-y-2">
          <div v-for="s in analytics.ordersByStatus" :key="s.status" class="flex items-center justify-between">
            <span class="text-sm capitalize">{{ s.status?.replace(/_/g, ' ') }}</span>
            <span class="font-medium">{{ s.count }}</span>
          </div>
        </div>
        <p v-else class="text-sm text-gray-500">No data</p>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Popular Products</h3>
        </template>
        <div v-if="popular.length" class="space-y-2">
          <div v-for="(p, i) in popular" :key="i" class="flex items-center justify-between">
            <span class="text-sm">{{ p.productName }}</span>
            <span class="text-sm font-medium">{{ p.totalSold }} sold</span>
          </div>
        </div>
        <p v-else class="text-sm text-gray-500">No data</p>
      </UCard>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Export</h3>
        </div>
      </template>
      <p class="mb-4 text-sm text-gray-500">Download order data as CSV for external analysis.</p>
      <UButton color="success" variant="outline" @click="exportCSV">
        <UIcon name="lucide:download" class="mr-2 h-4 w-4" />
        Export Orders CSV
      </UButton>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Analytics & Reports' })

const { data: analyticsData } = await useFetch('/api/admin/analytics')
const { data: popularData } = await useFetch('/api/admin/popular-products')

const analytics = computed(() => (analyticsData.value || {}) as any)
const popular = computed(() => (popularData.value || []) as any[])

const kpis = computed(() => [
  { label: 'Total Orders', value: String(analytics.value.totalOrders || 0) },
  { label: 'Revenue', value: `₹${analytics.value.totalRevenue || 0}` },
  { label: 'Active Stores', value: String(analytics.value.activeStores || 0) },
  { label: 'Products', value: String(analytics.value.totalProducts || 0) },
  { label: 'Delivery Partners', value: String(analytics.value.totalDeliveryPartners || 0) }
])

function exportCSV() {
  window.open('/api/admin/reports/orders.csv', '_blank')
}
</script>
