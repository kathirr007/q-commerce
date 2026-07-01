<template>
  <div>
    <div v-if="loading" class="py-12 text-center text-gray-500">Loading deliveries...</div>

    <div v-else-if="activeDeliveries.length === 0" class="py-12 text-center">
      <UIcon name="lucide:package" class="mx-auto mb-4 h-16 w-16 text-gray-300" />
      <p class="text-lg text-gray-500">No active deliveries</p>
    </div>

    <div v-else class="space-y-4">
      <UCard v-for="d in activeDeliveries" :key="d.id">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-semibold">Order #{{ d.orderId?.slice(0, 8) }}</p>
            <p class="text-sm text-gray-500">Total: ₹{{ d.order?.total }}</p>
            <p class="text-sm text-gray-500">{{ d.order?.deliveryAddress }}</p>
          </div>
          <div class="flex items-center gap-3">
            <UBadge :color="statusColor(d.status)" variant="soft">{{ d.status }}</UBadge>
            <USelect
              v-if="d.status !== 'delivered'"
              v-model="d.status"
              :items="statusOptions"
              @change="updateDeliveryStatus(d)"
              class="w-36"
            />
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'delivery' })
useSeoMeta({ title: 'Active Deliveries' })

const assignments = ref<any[]>([])
const loading = ref(true)

const statusOptions = [
  { label: 'Picked Up', value: 'picked_up' },
  { label: 'In Transit', value: 'in_transit' },
  { label: 'Delivered', value: 'delivered' }
]

onMounted(async () => {
  const { data } = await useFetch('/api/delivery/assignments')
  if (data.value) assignments.value = data.value as any[]
  loading.value = false
})

const activeDeliveries = computed(() =>
  assignments.value.filter((d: any) => d.status !== 'delivered')
)

async function updateDeliveryStatus(d: any) {
  await $fetch('/api/delivery/status', {
    method: 'PUT',
    body: { delivery_id: d.id, status: d.status }
  })
}

function statusColor(status: string) {
  const map: Record<string, 'info' | 'success' | 'warning'> = {
    assigned: 'info', picked_up: 'warning', in_transit: 'info', delivered: 'success'
  }
  return map[status] || 'info'
}
</script>
