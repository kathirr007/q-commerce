<template>
  <div class="container mx-auto px-4 py-8">
    <NuxtLink to="/stores" class="mb-4 inline-flex items-center gap-1 text-sm text-emerald-600 hover:underline">
      <UIcon name="lucide:arrow-left" class="h-4 w-4" />
      Back to stores
    </NuxtLink>

    <h1 class="mb-8 text-3xl font-bold">{{ store?.name || 'Store' }}</h1>

    <div v-if="loading" class="py-12 text-center text-gray-500">
      Loading...
    </div>

    <div v-else-if="products.length === 0" class="py-12 text-center text-gray-500">
      No products available.
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <ProductCard v-for="product in products" :key="product.id" :product="product" @add="addToCart" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '~~/stores/cart'

const route = useRoute()
const storeId = route.params.id as string

const store = ref<any>(null)
const products = ref<any[]>([])
const loading = ref(true)
const cart = useCartStore()

onMounted(async () => {
  const { data } = await useFetch(`/api/stores/${storeId}`)
  if (data.value) {
    const result = data.value as any
    store.value = { ...result }
    delete store.value.products
    products.value = result.products || []
  }
  loading.value = false
})

function addToCart(product: any) {
  cart.addItem({
    product_id: product.id,
    name: product.name,
    price: product.price,
    quantity: 1,
    store_id: storeId
  })
}
</script>
