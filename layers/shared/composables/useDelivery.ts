export const useDelivery = () => {
  const supabase = useSupabaseClient()

  async function getNearestPartner(storeLocation: { lat: number; lng: number }) {
    const { data } = await supabase
      .from('delivery_partners')
      .select('*')
      .eq('status', 'online')
      .limit(1)
      .single()

    return data
  }

  async function assignDelivery(orderId: string, partnerId: string) {
    const { error } = await (supabase as any)
      .from('deliveries')
      .insert({
        order_id: orderId,
        delivery_partner_id: partnerId,
        status: 'assigned'
      })

    if (error) throw error
  }

  async function trackDelivery(orderId: string) {
    const { data } = await supabase
      .from('deliveries')
      .select('*')
      .eq('order_id', orderId)
      .single()

    return data
  }

  return {
    getNearestPartner,
    assignDelivery,
    trackDelivery
  }
}
