<template>
  <USlideover v-model="open">
    <div class="flex flex-col h-full">
      <div class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
        <h2 class="text-lg font-semibold">Cart ({{ cart.totalItems }})</h2>
        <UButton color="neutral" variant="ghost" icon="lucide:x" @click="open = false" />
      </div>

      <div v-if="cart.items.length === 0" class="flex flex-1 items-center justify-center">
        <p class="text-gray-500">Your cart is empty</p>
      </div>

      <div v-else class="flex-1 overflow-y-auto p-4">
        <div v-for="item in cart.items" :key="item.product_id" class="mb-4 flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
          <div>
            <p class="font-medium">{{ item.name }}</p>
            <p class="text-sm text-emerald-600">₹{{ item.price }}</p>
          </div>
          <div class="flex items-center gap-3">
            <QuantitySelector :quantity="item.quantity" @update="cart.updateQuantity(item.product_id, $event)" />
            <UButton color="error" variant="ghost" size="xs" icon="lucide:trash-2" @click="cart.removeItem(item.product_id)" />
          </div>
        </div>
      </div>

      <div v-if="cart.items.length > 0" class="border-t border-gray-200 p-4 dark:border-gray-800">
        <div class="mb-2 flex justify-between text-sm">
          <span>Subtotal</span>
          <span>₹{{ cart.totalAmount }}</span>
        </div>
        <div class="mb-4 flex justify-between text-sm">
          <span>Delivery Fee</span>
          <span>₹20</span>
        </div>
        <div class="mb-4 flex justify-between font-semibold">
          <span>Total</span>
          <span>₹{{ cart.totalAmount + 20 }}</span>
        </div>
        <UButton to="/checkout" color="success" class="w-full" size="lg" @click="open = false">
          Proceed to Checkout
        </UButton>
      </div>
    </div>
  </USlideover>
</template>

<script setup lang="ts">
import { useCartStore } from '~~/stores/cart'

const open = defineModel<boolean>('open', { default: false })
const cart = useCartStore()
</script>
