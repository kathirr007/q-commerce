<template>
  <div class="flex flex-col min-h-screen">
    <header class="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
      <div class="container mx-auto flex h-16 items-center justify-between px-4">
        <NuxtLink to="/" class="flex items-center gap-2 text-xl font-bold text-emerald-600">
          <UIcon name="lucide:package" class="h-6 w-6" />
          QCommerce
        </NuxtLink>

        <nav class="flex items-center gap-4">
          <template v-if="user">
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ user.email }}</span>
          <UButton color="neutral" variant="ghost" @click="logout">
            Logout
          </UButton>
        </template>
        <template v-else>
            <UButton to="/login" variant="ghost" color="neutral">
              Sign In
            </UButton>
            <UButton to="/register" color="success">
              Get Started
            </UButton>
          </template>
        </nav>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-gray-200 py-8 dark:border-gray-800">
      <div class="container mx-auto px-4 text-center text-sm text-gray-500">
        &copy; {{ new Date().getFullYear() }} QCommerce. All rights reserved.
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

async function logout() {
  await supabase.auth.signOut()
  navigateTo('/login')
}
</script>
