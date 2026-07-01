<template>
  <div>
    <UCard>
      <UTable :rows="partners" :columns="columns" :loading="loading">
        <template #status-cell="{ row }">
          <UBadge :color="row.status === 'online' ? 'success' : row.status === 'busy' ? 'warning' : 'neutral'" variant="soft">{{ row.status }}</UBadge>
        </template>
        <template #actions-cell="{ row }">
          <USelect v-model="row.status" :items="statusOptions" @change="updateStatus(row)" class="w-36" />
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Delivery Partners' })

const partners = ref<any[]>([])
const loading = ref(true)

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'vehicleType', label: 'Vehicle' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '' }
]

const statusOptions = [
  { label: 'Online', value: 'online' },
  { label: 'Offline', value: 'offline' },
  { label: 'Busy', value: 'busy' }
]

onMounted(async () => {
  const { data } = await useFetch('/api/admin/delivery-partners')
  if (data.value) partners.value = data.value as any[]
  loading.value = false
})

async function updateStatus(partner: any) {
  await $fetch(`/api/admin/delivery-partners/${partner.id}`, {
    method: 'PUT',
    body: { status: partner.status }
  })
}
</script>
