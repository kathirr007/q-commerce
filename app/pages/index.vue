<template>
  <div class="container mx-auto px-4 py-12">
    <section class="mb-16 text-center">
      <h1 class="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
        Everything delivered
        <span class="text-emerald-600">in minutes</span>
      </h1>
      <p class="mx-auto mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
        Groceries, medicines, electronics &mdash; get anything from local stores near you.
      </p>
      <UButton to="/stores" size="xl" color="success">
        Explore Stores
      </UButton>
    </section>

    <section class="grid gap-8 md:grid-cols-3">
      <UCard v-for="feature in features" :key="feature.title">
        <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900">
          <UIcon :name="feature.icon" class="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 class="mb-2 text-lg font-semibold">{{ feature.title }}</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">{{ feature.description }}</p>
      </UCard>
    </section>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Home',
  description: 'Quick commerce delivery app — get everything delivered in minutes'
})

const features = [
  {
    icon: 'lucide:store',
    title: 'Local Stores',
    description: 'Browse products from stores near your location.'
  },
  {
    icon: 'lucide:zap',
    title: 'Lightning Fast',
    description: 'Delivery in 10-30 minutes, right to your doorstep.'
  },
  {
    icon: 'lucide:shield-check',
    title: 'Secure Payments',
    description: 'Pay securely via Razorpay with multiple options.'
  }
]
</script>
