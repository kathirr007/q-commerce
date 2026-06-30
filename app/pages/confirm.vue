<script setup lang="ts">
const supabase = useSupabaseClient()

onMounted(async () => {
  const { error } = await supabase.auth.verifyOtp({
    type: 'signup',
    token_hash: useRoute().query.token_hash as string
  })

  if (error) {
    alert(error.message)
  }

  navigateTo('/login')
})
</script>

<template>
  <div class="flex min-h-[60vh] items-center justify-center">
    <p>Confirming your email...</p>
  </div>
</template>
