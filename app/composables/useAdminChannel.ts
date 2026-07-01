export function useAdminChannel(onUpdate: () => void) {
  const supabase = useSupabaseClient()
  const channel = ref<any>(null)

  function subscribe() {
    if (channel.value) return

    channel.value = supabase
      .channel('admin-stats')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => onUpdate()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'deliveries' },
        () => onUpdate()
      )
      .subscribe()
  }

  function unsubscribe() {
    if (channel.value) {
      supabase.removeChannel(channel.value)
      channel.value = null
    }
  }

  onUnmounted(() => unsubscribe())

  return { subscribe, unsubscribe }
}
