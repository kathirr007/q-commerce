export function useOrderChannel(orderId: string, onUpdate: (payload: any) => void) {
  const supabase = useSupabaseClient()
  const channel = ref<any>(null)
  const isActive = ref(false)

  function subscribe() {
    if (channel.value) return

    channel.value = supabase
      .channel(`order-${orderId}`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload: any) => onUpdate(payload.new)
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deliveries',
          filter: `order_id=eq.${orderId}`
        },
        (payload: any) => onUpdate(payload.new)
      )
      .subscribe()

    isActive.value = true
  }

  function unsubscribe() {
    if (channel.value) {
      supabase.removeChannel(channel.value)
      channel.value = null
      isActive.value = false
    }
  }

  onUnmounted(() => unsubscribe())

  return { subscribe, unsubscribe, isActive }
}
