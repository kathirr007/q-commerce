<template>
  <div>
    <div v-if="loading" class="py-12 text-center text-gray-500">Loading history...</div>

    <div v-else-if="completed.length === 0" class="py-12 text-center">
      <p class="text-lg text-gray-500">No completed deliveries</p>
    </div>

    <div v-else class="space-y-4">
      <UCard v-for="d in completed" :key="d.id">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-semibold">Order #{{ d.orderId?.slice(0, 8) }}</p>
            <p class="text-sm text-gray-500">₹{{ d.order?.total }}</p>
          </div>
          <UBadge color="success" variant="soft">Delivered</UBadge>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'delivery' })
useSeoMeta({ title: 'Delivery History' })

const assignments = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  const { data } = await useFetch('/api/delivery/assignments')
  if (data.value) assignments.value = data.value as any[]
  loading.value = false
})

const completed = computed(() =>
  assignments.value.filter((d: any) => d.status === 'delivered')
)
</script>
