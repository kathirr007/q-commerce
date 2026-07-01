<template>
  <div>
    <UCard>
      <UTable :rows="orders" :columns="columns" :loading="loading">
        <template #status-cell="{ row }">
          <UBadge :color="statusColor(row.status)" variant="soft">{{ row.status }}</UBadge>
        </template>
        <template #actions-cell="{ row }">
          <USelect v-model="row.status" :items="statusOptions" @change="updateStatus(row)" class="w-40" />
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Orders' })

const orders = ref<any[]>([])
const loading = ref(true)

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'total', label: 'Total' },
  { key: 'status', label: 'Status' },
  { key: 'paymentStatus', label: 'Payment' },
  { key: 'createdAt', label: 'Date' },
  { key: 'actions', label: '' }
]

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Preparing', value: 'preparing' },
  { label: 'Out for Delivery', value: 'out_for_delivery' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' }
]

onMounted(async () => {
  const { data } = await useFetch('/api/admin/orders')
  if (data.value) orders.value = data.value as any[]
  loading.value = false
})

async function updateStatus(order: any) {
  await $fetch(`/api/admin/orders/${order.id}`, {
    method: 'PUT',
    body: { status: order.status }
  })
}

function statusColor(status: string) {
  const map: Record<string, 'warning' | 'info' | 'success' | 'neutral'> = {
    pending: 'warning', confirmed: 'info', preparing: 'info',
    out_for_delivery: 'info', delivered: 'success', cancelled: 'neutral'
  }
  return map[status] || 'neutral'
}
</script>
