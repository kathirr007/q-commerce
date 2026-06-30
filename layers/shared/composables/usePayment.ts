export const usePayment = () => {
  const supabase = useSupabaseClient()

  async function createPayment(orderId: string, amount: number, method: 'razorpay' | 'cod' = 'razorpay') {
    if (method === 'cod') {
      const { error } = await (supabase as any)
        .from('payments')
        .insert({
          order_id: orderId,
          method: 'cod',
          status: 'pending',
          amount
        })

      if (error) throw error
      return { method: 'cod' }
    }

      const { data, error } = await (supabase as any)
      .from('payments')
      .insert({
        order_id: orderId,
        method: 'razorpay',
        status: 'pending',
        amount
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  return {
    createPayment
  }
}
