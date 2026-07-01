<template>
  <div v-if="showPrompt" class="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
    <UCard>
      <div class="flex items-start gap-3">
        <UIcon name="lucide:smartphone" class="mt-1 h-8 w-8 flex-shrink-0 text-emerald-600" />
        <div class="flex-1">
          <p class="font-semibold">Install QCommerce</p>
          <p class="text-sm text-gray-500">Install the app for a faster experience.</p>
        </div>
      </div>
      <div class="mt-3 flex justify-end gap-2">
        <UButton color="neutral" variant="ghost" size="sm" @click="dismiss">Not now</UButton>
        <UButton color="success" size="sm" @click="install">Install</UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const showPrompt = ref(false)
let deferredPrompt: any = null

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    setTimeout(() => { showPrompt.value = true }, 10000)
  })
})

async function install() {
  if (!deferredPrompt) return
  deferredPrompt.prompt()
  const result = await deferredPrompt.userChoice
  if (result.outcome === 'accepted') showPrompt.value = false
  deferredPrompt = null
}

function dismiss() {
  showPrompt.value = false
}
</script>
