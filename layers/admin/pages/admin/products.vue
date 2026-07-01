<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <p class="text-sm text-gray-500">{{ products.length }} products</p>
      <UButton color="success" @click="showForm = true">Add Product</UButton>
    </div>

    <UModal v-model="showForm">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">{{ editingProduct ? 'Edit Product' : 'Add Product' }}</h3>
        </template>
        <UForm :state="form" @submit="saveProduct">
          <UFormField label="Name" required>
            <UInput v-model="form.name" class="w-full" />
          </UFormField>
          <UFormField label="Description">
            <UTextarea v-model="form.description" class="w-full" />
          </UFormField>
          <UFormField label="Price" required>
            <UInput v-model="form.price" type="number" step="0.01" class="w-full" />
          </UFormField>
          <UFormField label="Store" required>
            <USelect v-model="form.store_id" :items="storeOptions" class="w-full" />
          </UFormField>
          <UFormField label="Stock Level">
            <UInput v-model="form.stock_level" type="number" class="w-full" />
          </UFormField>
          <UButton type="submit" color="success" class="mt-4">Save</UButton>
        </UForm>
      </UCard>
    </UModal>

    <UCard>
      <UTable :rows="products" :columns="columns" :loading="loading">
        <template #status-cell="{ row }">
          <UBadge :color="row.status === 'active' ? 'success' : 'neutral'" variant="soft">{{ row.status }}</UBadge>
        </template>
        <template #actions-cell="{ row }">
          <UButton color="neutral" variant="ghost" size="sm" @click="editProduct(row)">Edit</UButton>
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Products' })

const products = ref<any[]>([])
const stores = ref<any[]>([])
const loading = ref(true)
const showForm = ref(false)
const editingProduct = ref<any>(null)

const form = reactive({ name: '', description: '', price: '', store_id: '', stock_level: '' })

const columns = [{ key: 'name', label: 'Name' }, { key: 'price', label: 'Price' }, { key: 'status', label: 'Status' }, { key: 'actions', label: '' }]

const storeOptions = computed(() => stores.value.map((s: any) => ({ label: s.name, value: s.id })))

onMounted(async () => {
  const [p, s] = await Promise.all([
    $fetch('/api/admin/products'),
    $fetch('/api/admin/stores')
  ])
  products.value = p as any[]
  stores.value = s as any[]
  loading.value = false
})

function editProduct(product: any) {
  editingProduct.value = product
  form.name = product.name
  form.description = product.description || ''
  form.price = String(product.price)
  form.store_id = product.storeId
  form.stock_level = ''
  showForm.value = true
}

async function saveProduct() {
  const body: any = {
    name: form.name,
    description: form.description,
    price: parseFloat(form.price),
    store_id: form.store_id,
    stock_level: parseInt(form.stock_level) || 0
  }

  if (editingProduct.value) {
    await $fetch(`/api/admin/products/${editingProduct.value.id}`, { method: 'PUT', body })
  } else {
    await $fetch('/api/admin/products', { method: 'POST', body })
  }

  showForm.value = false
  editingProduct.value = null
  Object.assign(form, { name: '', description: '', price: '', store_id: '', stock_level: '' })
  const { data } = await useFetch('/api/admin/products')
  if (data.value) products.value = data.value as any[]
}
</script>
