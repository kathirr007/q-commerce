<template>
  <div class="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <h2 class="text-center text-2xl font-bold">Create Account</h2>
      </template>

      <form @submit.prevent="handleRegister">
        <UFormGroup label="Full Name" name="name" class="mb-4">
          <UInput v-model="name" placeholder="John Doe" required />
        </UFormGroup>

        <UFormGroup label="Email" name="email" class="mb-4">
          <UInput v-model="email" type="email" placeholder="you@example.com" required />
        </UFormGroup>

        <UFormGroup label="Phone" name="phone" class="mb-4">
          <UInput v-model="phone" type="tel" placeholder="+91 9876543210" />
        </UFormGroup>

        <UFormGroup label="Password" name="password" class="mb-4">
          <UInput v-model="password" type="password" required />
        </UFormGroup>

        <UFormGroup label="Role" name="role" class="mb-6">
          <USelect v-model="role" :items="roleOptions" />
        </UFormGroup>

        <UButton type="submit" color="success" block :loading="loading">
          Create Account
        </UButton>
      </form>

      <p class="mt-4 text-center text-sm text-gray-500">
        Already have an account?
        <NuxtLink to="/login" class="text-emerald-600 hover:underline">Sign In</NuxtLink>
      </p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['guest']
})

useSeoMeta({ title: 'Register' })

const supabase = useSupabaseClient()
const name = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const role = ref('customer')
const loading = ref(false)

const roleOptions = [
  { label: 'Customer', value: 'customer' },
  { label: 'Store Manager', value: 'store_manager' },
  { label: 'Delivery Partner', value: 'delivery' },
  { label: 'Admin', value: 'admin' }
]

async function handleRegister() {
  loading.value = true
  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      data: {
        name: name.value,
        phone: phone.value,
        role: role.value
      }
    }
  })
  loading.value = false

  if (error) {
    alert(error.message)
    return
  }

  navigateTo('/login')
}
</script>
