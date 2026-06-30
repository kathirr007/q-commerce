<template>
  <div class="container mx-auto px-4 py-8">
    <NuxtLink to="/stores" class="mb-4 inline-flex items-center gap-1 text-sm text-emerald-600 hover:underline">
      <UIcon name="lucide:arrow-left" class="h-4 w-4" />
      Back to stores
    </NuxtLink>

    <h1 class="mb-8 text-3xl font-bold">{{ store?.name || 'Store' }}</h1>

    <div v-if="products.length === 0" class="py-12 text-center text-gray-500">
      No products available.
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <UCard v-for="product in products" :key="product.id">
        <div class="aspect-square mb-3 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
          <UIcon name="lucide:package" class="h-12 w-12 text-gray-400" />
        </div>
        <h3 class="font-semibold">{{ product.name }}</h3>
        <p class="mb-2 text-sm text-gray-500">{{ product.description }}</p>
        <div class="flex items-center justify-between">
          <span class="text-lg font-bold text-emerald-600">₹{{ product.price }}</span>
          <UButton color="success" size="sm" @click="addToCart(product)">
            Add to Cart
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const supabase = useSupabaseClient()
const storeId = route.params.id as string

const store = ref<any>(null)
const products = ref<any[]>([])

onMounted(async () => {
  const { data: storeData } = await (supabase as any)
    .from('stores')
    .select('*')
    .eq('id', storeId)
    .single()

  if (storeData) store.value = storeData

  const { data: productData } = await (supabase as any)
    .from('products')
    .select('*, inventory(*)')
    .eq('store_id', storeId)

  if (productData) products.value = productData
})

async function addToCart(product: any) {
  const cart = useCart()
  cart.addItem({
    product_id: product.id,
    name: product.name,
    price: product.price,
    quantity: 1,
    store_id: storeId
  })
}
</script>
