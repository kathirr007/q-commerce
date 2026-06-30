<template>
  <div class="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <h2 class="text-center text-2xl font-bold">Sign In</h2>
      </template>

      <form @submit.prevent="handleLogin">
        <UFormGroup label="Email" name="email" class="mb-4">
          <UInput v-model="email" type="email" placeholder="you@example.com" required />
        </UFormGroup>

        <UFormGroup label="Password" name="password" class="mb-6">
          <UInput v-model="password" type="password" required />
        </UFormGroup>

        <UButton type="submit" color="success" block :loading="loading">
          Sign In
        </UButton>
      </form>

      <p class="mt-4 text-center text-sm text-gray-500">
        Don&rsquo;t have an account?
        <NuxtLink to="/register" class="text-emerald-600 hover:underline">Register</NuxtLink>
      </p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['guest']
})

useSeoMeta({ title: 'Sign In' })

const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const loading = ref(false)

async function handleLogin() {
  loading.value = true
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })
  loading.value = false

  if (error) {
    alert(error.message)
    return
  }

  navigateTo('/')
}
</script>
