<template>
  <div class="flex min-h-screen bg-gray-50 dark:bg-gray-950">
    <aside class="w-64 border-r border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <NuxtLink to="/admin" class="mb-6 flex items-center gap-2 text-xl font-bold text-emerald-600">
        <UIcon name="lucide:package" class="h-6 w-6" />
        Admin
      </NuxtLink>
      <nav class="space-y-1">
        <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          :class="isActive(item.to) ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'">
          <UIcon :name="item.icon" class="h-5 w-5" />
          {{ item.label }}
        </NuxtLink>
      </nav>
    </aside>
    <div class="flex-1">
      <header class="flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
        <h2 class="text-lg font-semibold">{{ pageTitle }}</h2>
        <UButton color="neutral" variant="ghost" to="/">View Site</UButton>
      </header>
      <main class="p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/admin': 'Dashboard',
    '/admin/stores': 'Stores',
    '/admin/products': 'Products',
    '/admin/orders': 'Orders',
    '/admin/delivery-partners': 'Delivery Partners',
    '/admin/reports': 'Reports'
  }
  for (const [path, title] of Object.entries(titles)) {
    if (route.path.startsWith(path)) return title
  }
  return 'Admin'
})

const navItems = [
  { label: 'Dashboard', icon: 'lucide:layout-dashboard', to: '/admin' },
  { label: 'Stores', icon: 'lucide:store', to: '/admin/stores' },
  { label: 'Products', icon: 'lucide:package', to: '/admin/products' },
  { label: 'Orders', icon: 'lucide:shopping-cart', to: '/admin/orders' },
  { label: 'Delivery Partners', icon: 'lucide:truck', to: '/admin/delivery-partners' },
  { label: 'Reports', icon: 'lucide:bar-chart-3', to: '/admin/reports' }
]

function isActive(path: string) {
  return route.path.startsWith(path)
}
</script>
