<template>
  <div>
    <div class="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <UCard v-for="stat in stats" :key="stat.label">
        <div class="text-2xl font-bold text-emerald-600">{{ stat.value }}</div>
        <div class="text-sm text-gray-500">{{ stat.label }}</div>
      </UCard>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Recent Orders</h2>
            <UButton to="/admin/orders" color="success" variant="outline" size="sm">View All</UButton>
          </div>
        </template>
        <div v-if="recentOrders.length === 0" class="py-4 text-center text-sm text-gray-500">No orders yet.</div>
        <div v-else class="space-y-3">
          <div v-for="order in recentOrders" :key="order.id" class="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
            <div>
              <p class="text-sm font-medium">#{{ order.id.slice(0, 8) }}</p>
              <p class="text-xs text-gray-500">₹{{ order.total }}</p>
            </div>
            <UBadge :color="statusColor(order.status)" variant="soft" size="sm">{{ order.status }}</UBadge>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Store Overview</h2>
            <UButton to="/admin/stores" color="success" variant="outline" size="sm">Manage</UButton>
          </div>
        </template>
        <div v-if="stores.length === 0" class="py-4 text-center text-sm text-gray-500">No stores yet.</div>
        <div v-else class="space-y-3">
          <div v-for="store in stores.slice(0, 5)" :key="store.id" class="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
            <p class="text-sm font-medium">{{ store.name }}</p>
            <UBadge :color="store.status === 'active' ? 'success' : 'neutral'" variant="soft" size="sm">{{ store.status }}</UBadge>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Admin Dashboard' })

const { data: statsData, refresh: refreshStats } = await useFetch('/api/admin/stats')
const { data: stores } = await useFetch('/api/admin/stores')
const { data: orders, refresh: refreshOrders } = await useFetch('/api/admin/orders')

const channel = useAdminChannel(() => {
  refreshStats()
  refreshOrders()
})

onMounted(() => {
  channel.subscribe()
})

const stats = computed(() => [
  { label: 'Total Orders', value: String((statsData.value as any)?.totalOrders || 0) },
  { label: 'Active Stores', value: String((statsData.value as any)?.activeStores || 0) },
  { label: 'Delivery Partners', value: String((statsData.value as any)?.deliveryPartners || 0) },
  { label: 'Revenue Today', value: `₹${(statsData.value as any)?.revenueToday || 0}` }
])

const recentOrders = computed(() => ((orders as any).value || []).slice(0, 5))

function statusColor(status: string) {
  const map: Record<string, 'warning' | 'info' | 'success' | 'neutral'> = {
    pending: 'warning', confirmed: 'info', preparing: 'info',
    out_for_delivery: 'info', delivered: 'success', cancelled: 'neutral'
  }
  return map[status] || 'neutral'
}
</script>
