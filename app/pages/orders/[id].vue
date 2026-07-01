<template>
  <div class="container mx-auto px-4 py-8">
    <NuxtLink to="/orders" class="mb-4 inline-flex items-center gap-1 text-sm text-emerald-600 hover:underline">
      <UIcon name="lucide:arrow-left" class="h-4 w-4" />
      Back to Orders
    </NuxtLink>

    <div v-if="loading" class="py-12 text-center text-gray-500">
      Loading order...
    </div>

    <template v-else-if="order">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">Order #{{ order.id?.slice(0, 8) }}</h1>
          <p class="text-gray-500">{{ formatDate(order.createdAt) }}</p>
        </div>
        <UBadge :color="statusColor(order.status)" variant="soft" size="lg">
          {{ order.status }}
        </UBadge>
      </div>

      <div class="grid gap-8 lg:grid-cols-3">
        <div class="lg:col-span-2 space-y-6">
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Items</h3>
            </template>
            <div v-for="item in order.items" :key="item.id" class="flex items-center justify-between py-2">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                  <UIcon name="lucide:package" class="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p class="font-medium">{{ item.productId }}</p>
                  <p class="text-sm text-gray-500">Qty: {{ item.quantity }}</p>
                </div>
              </div>
              <span class="font-medium">₹{{ item.unitPrice * item.quantity }}</span>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Delivery Address</h3>
            </template>
            <p>{{ order.deliveryAddress }}</p>
          </UCard>

          <UCard v-if="order.payment">
            <template #header>
              <h3 class="text-lg font-semibold">Payment</h3>
            </template>
            <div class="flex items-center justify-between">
              <span>{{ order.payment.method === 'cod' ? 'Cash on Delivery' : 'Razorpay' }}</span>
              <UBadge :color="order.payment.status === 'paid' ? 'success' : 'warning'" variant="soft">
                {{ order.payment.status }}
              </UBadge>
            </div>
          </UCard>

          <UCard v-if="delivery">
            <template #header>
              <h3 class="text-lg font-semibold">Delivery Tracking</h3>
            </template>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <UBadge :color="trackingStatusColor(delivery.status)" variant="soft" size="lg">{{ delivery.status }}</UBadge>
              </div>
              <div class="space-y-3">
                <div v-for="(step, i) in deliverySteps" :key="step.key" class="flex items-start gap-3">
                  <div class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                    :class="step.completed ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'">
                    <UIcon v-if="step.completed" name="lucide:check" class="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p class="text-sm font-medium" :class="step.completed ? 'text-emerald-600' : 'text-gray-500'">{{ step.label }}</p>
                    <p v-if="step.time" class="text-xs text-gray-400">{{ step.time }}</p>
                  </div>
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <div>
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Order Summary</h3>
            </template>
            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{{ order.total - (order.deliveryFee || 20) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span>₹{{ order.deliveryFee || 20 }}</span>
              </div>
              <UDivider />
              <div class="flex justify-between font-semibold">
                <span>Total</span>
                <span>₹{{ order.total }}</span>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
useSeoMeta({ title: 'Order Details' })

const order = ref<any>(null)
const loading = ref(true)

const stepOrder = ['assigned', 'picked_up', 'in_transit', 'delivered']

onMounted(async () => {
  const { data } = await useFetch(`/api/orders/${route.params.id}`)
  if (data.value) order.value = data.value as any
  loading.value = false

  const channel = useOrderChannel(route.params.id as string, (payload) => {
    if (order.value) {
      Object.assign(order.value, payload)
    }
  })
  channel.subscribe()
})

const delivery = computed(() => (order.value as any)?.delivery || null)

const deliverySteps = computed(() => {
  const d = delivery.value
  if (!d) return []
  const currentIdx = stepOrder.indexOf(d.status)
  return [
    { key: 'assigned', label: 'Order assigned to partner', completed: currentIdx >= 0, time: d.pickupTime ? '' : '' },
    { key: 'picked_up', label: 'Order picked up', completed: currentIdx >= 1, time: d.pickupTime ? formatDate(d.pickupTime) : '' },
    { key: 'in_transit', label: 'Out for delivery', completed: currentIdx >= 2, time: '' },
    { key: 'delivered', label: 'Delivered', completed: currentIdx >= 3, time: d.deliveredTime ? formatDate(d.deliveredTime) : '' }
  ]
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

function trackingStatusColor(status: string) {
  const map: Record<string, 'info' | 'warning' | 'success'> = {
    assigned: 'info', picked_up: 'warning', in_transit: 'info', delivered: 'success'
  }
  return map[status] || 'info'
}
</script>
