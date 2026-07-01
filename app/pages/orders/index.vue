<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="mb-8 text-3xl font-bold">My Orders</h1>

    <div v-if="loading" class="py-12 text-center text-gray-500">
      Loading orders...
    </div>

    <div v-else-if="orders.length === 0" class="py-12 text-center">
      <UIcon name="lucide:package" class="mx-auto mb-4 h-16 w-16 text-gray-300" />
      <p class="mb-4 text-lg text-gray-500">No orders yet</p>
      <UButton to="/stores" color="success">Start Shopping</UButton>
    </div>

    <div v-else class="space-y-4">
      <UCard v-for="order in orders" :key="order.id" :to="`/orders/${order.id}`" class="cursor-pointer hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">{{ formatDate(order.createdAt) }}</p>
            <p class="font-semibold">₹{{ order.total }}</p>
          </div>
          <div class="flex items-center gap-3">
            <UBadge :color="statusColor(order.status)" variant="soft">
              {{ order.status }}
            </UBadge>
            <UIcon name="lucide:chevron-right" class="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'My Orders' })

const orders = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  const { data } = await useFetch('/api/orders')
  if (data.value) orders.value = data.value as any[]
  loading.value = false
})

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

function statusColor(status: string) {
  const map: Record<string, 'warning' | 'info' | 'success' | 'neutral'> = {
    pending: 'warning',
    confirmed: 'info',
    preparing: 'info',
    out_for_delivery: 'info',
    delivered: 'success',
    cancelled: 'neutral'
  }
  return map[status] || 'neutral'
}
</script>
