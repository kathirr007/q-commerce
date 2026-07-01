<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="mb-8 text-3xl font-bold">Shopping Cart</h1>

    <div v-if="cart.items.length === 0" class="py-12 text-center">
      <UIcon name="lucide:shopping-cart" class="mx-auto mb-4 h-16 w-16 text-gray-300" />
      <p class="mb-4 text-lg text-gray-500">Your cart is empty</p>
      <UButton to="/stores" color="success">Browse Stores</UButton>
    </div>

    <div v-else class="grid gap-8 lg:grid-cols-3">
      <div class="lg:col-span-2 space-y-4">
        <UCard v-for="item in cart.items" :key="item.product_id">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                <UIcon name="lucide:package" class="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 class="font-semibold">{{ item.name }}</h3>
                <p class="text-sm text-emerald-600">₹{{ item.price }}</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <QuantitySelector :quantity="item.quantity" @update="cart.updateQuantity(item.product_id, $event)" />
              <p class="w-20 text-right font-medium">₹{{ item.price * item.quantity }}</p>
              <UButton color="error" variant="ghost" icon="lucide:trash-2" @click="cart.removeItem(item.product_id)" />
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
              <span>Subtotal ({{ cart.totalItems }} items)</span>
              <span>₹{{ cart.totalAmount }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span>Delivery Fee</span>
              <span>₹20</span>
            </div>
            <UDivider />
            <div class="flex justify-between font-semibold">
              <span>Total</span>
              <span>₹{{ cart.totalAmount + 20 }}</span>
            </div>
            <UButton to="/checkout" color="success" class="w-full" size="lg">
              Proceed to Checkout
            </UButton>
            <UButton to="/stores" color="neutral" variant="outline" class="w-full">
              Continue Shopping
            </UButton>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '~~/stores/cart'

useSeoMeta({ title: 'Cart' })
const cart = useCartStore()
</script>
