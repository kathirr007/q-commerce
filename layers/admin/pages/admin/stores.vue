<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <p class="text-sm text-gray-500">{{ stores.length }} stores</p>
      <UButton color="success" @click="showForm = true">Add Store</UButton>
    </div>

    <UModal v-model="showForm">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">{{ editingStore ? 'Edit Store' : 'Add Store' }}</h3>
        </template>
        <UForm :state="form" @submit="saveStore">
          <UFormField label="Name" required>
            <UInput v-model="form.name" class="w-full" />
          </UFormField>
          <UFormField label="Type" required>
            <USelect v-model="form.type" :items="[{ label: 'Dark Store', value: 'dark_store' }, { label: 'Retail', value: 'retail' }]" class="w-full" />
          </UFormField>
          <UFormField label="Latitude">
            <UInput v-model="form.lat" type="number" step="any" class="w-full" />
          </UFormField>
          <UFormField label="Longitude">
            <UInput v-model="form.lng" type="number" step="any" class="w-full" />
          </UFormField>
          <UButton type="submit" color="success" class="mt-4">Save</UButton>
        </UForm>
      </UCard>
    </UModal>

    <UCard>
      <UTable :rows="stores" :columns="columns" :loading="loading">
        <template #status-cell="{ row }">
          <UBadge :color="row.status === 'active' ? 'success' : 'neutral'" variant="soft">{{ row.status }}</UBadge>
        </template>
        <template #actions-cell="{ row }">
          <UButton color="neutral" variant="ghost" size="sm" @click="editStore(row)">Edit</UButton>
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Stores' })

const stores = ref<any[]>([])
const loading = ref(true)
const showForm = ref(false)
const editingStore = ref<any>(null)

const form = reactive({ name: '', type: 'dark_store', lat: '', lng: '' })

const columns = [{ key: 'name', label: 'Name' }, { key: 'type', label: 'Type' }, { key: 'status', label: 'Status' }, { key: 'actions', label: '' }]

onMounted(async () => {
  const { data } = await useFetch('/api/admin/stores')
  if (data.value) stores.value = data.value as any[]
  loading.value = false
})

function editStore(store: any) {
  editingStore.value = store
  form.name = store.name
  form.type = store.type
  form.lat = store.location?.lat?.toString() || ''
  form.lng = store.location?.lng?.toString() || ''
  showForm.value = true
}

async function saveStore() {
  const body: any = {
    name: form.name,
    type: form.type,
    location: { lat: parseFloat(form.lat) || 0, lng: parseFloat(form.lng) || 0 }
  }

  if (editingStore.value) {
    await $fetch(`/api/admin/stores/${editingStore.value.id}`, { method: 'PUT', body })
  } else {
    await $fetch('/api/admin/stores', { method: 'POST', body })
  }

  showForm.value = false
  editingStore.value = null
  Object.assign(form, { name: '', type: 'dark_store', lat: '', lng: '' })
  const { data } = await useFetch('/api/admin/stores')
  if (data.value) stores.value = data.value as any[]
}
</script>
