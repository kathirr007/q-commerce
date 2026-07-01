<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="mb-8 text-3xl font-bold">Checkout</h1>

    <div v-if="cart.items.length === 0" class="py-12 text-center">
      <p class="mb-4 text-lg text-gray-500">Your cart is empty</p>
      <UButton to="/stores" color="success">Browse Stores</UButton>
    </div>

    <div v-else class="grid gap-8 lg:grid-cols-3">
      <div class="lg:col-span-2">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Delivery Details</h3>
          </template>
          <UForm :state="state" :schema="schema" @submit="handleSubmit">
            <UFormField label="Full Name" name="name" required>
              <UInput v-model="state.name" placeholder="John Doe" class="w-full" />
            </UFormField>
            <UFormField label="Phone Number" name="phone" required>
              <UInput v-model="state.phone" placeholder="+91 98765 43210" class="w-full" />
            </UFormField>
            <UFormField label="Delivery Address" name="address" required>
              <UTextarea v-model="state.address" placeholder="House / Flat No., Street, Area, City, Pincode" class="w-full" />
            </UFormField>
            <UFormField label="Payment Method" name="paymentMethod" required>
              <USelect v-model="state.paymentMethod" :items="paymentOptions" class="w-full" />
            </UFormField>
            <UButton type="submit" color="success" class="mt-4 w-full" size="lg" :loading="submitting">
              Place Order — ₹{{ cart.totalAmount + 20 }}
            </UButton>
          </UForm>
        </UCard>
      </div>

      <div>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Order Summary</h3>
          </template>
          <div class="space-y-4">
            <div v-for="item in cart.items" :key="item.product_id" class="flex justify-between text-sm">
              <span>{{ item.name }} × {{ item.quantity }}</span>
              <span>₹{{ item.price * item.quantity }}</span>
            </div>
            <UDivider />
            <div class="flex justify-between text-sm">
              <span>Subtotal</span>
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
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { useCartStore } from '~~/stores/cart'

useSeoMeta({ title: 'Checkout' })

const cart = useCartStore()
const submitting = ref(false)
const router = useRouter()

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number required'),
  address: z.string().min(10, 'Please enter a complete address'),
  paymentMethod: z.enum(['cod', 'razorpay'])
})

const state = reactive({
  name: '',
  phone: '',
  address: '',
  paymentMethod: 'cod' as 'cod' | 'razorpay'
})

const paymentOptions = [
  { label: 'Cash on Delivery', value: 'cod' },
  { label: 'Razorpay (Card / UPI / Net Banking)', value: 'razorpay' }
]

async function handleSubmit() {
  submitting.value = true
  try {
    const order: any = await $fetch('/api/orders', {
      method: 'POST',
      body: {
        store_id: cart.storeId,
        delivery_address: `${state.name}, ${state.phone}, ${state.address}`,
        items: cart.items.map((item: any) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.price
        })),
        payment_method: state.paymentMethod
      }
    })

    if (state.paymentMethod === 'razorpay') {
      const razorpayOrder: any = await $fetch('/api/razorpay/create-order', {
        method: 'POST',
        body: { amount: cart.totalAmount + 20, order_id: order.id }
      })

      const result = await new Promise<any>((resolve, reject) => {
        const rzp = new (window as any).Razorpay({
          key: useRuntimeConfig().public.razorpayKeyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'QCommerce',
          order_id: razorpayOrder.id,
          prefill: { name: state.name, contact: state.phone },
          handler: (response: any) => resolve(response),
          modal: { ondismiss: () => reject(new Error('Payment cancelled')) }
        })
        rzp.open()
      })

      await $fetch('/api/razorpay/verify', {
        method: 'POST',
        body: {
          order_id: result.razorpay_order_id,
          payment_id: result.razorpay_payment_id,
          razorpay_signature: result.razorpay_signature
        }
      })

      await $fetch('/api/payments', {
        method: 'POST',
        body: {
          order_id: order.id,
          method: 'razorpay',
          transaction_id: result.razorpay_payment_id
        }
      })
    }

    cart.clear()
    router.push(`/orders/${order.id}`)
  } catch (e: any) {
    console.error('Order failed:', e)
  } finally {
    submitting.value = false
  }
}
</script>
