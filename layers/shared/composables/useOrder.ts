export const useOrder = () => {
  const supabase = useSupabaseClient()
  const orders = ref<any[]>([])

  async function fetchOrders() {
    const { data } = await (supabase as any)
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })

    if (data) orders.value = data
  }

  async function placeOrder(items: Array<{ product_id: string; quantity: number; unit_price: number }>, storeId: string, deliveryAddress: string) {
    const user = useSupabaseUser()
    if (!user.value) throw new Error('Not authenticated')

    const total = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)

    const { data: order, error } = await (supabase as any)
      .from('orders')
      .insert({
        user_id: user.value.id,
        store_id: storeId,
        total,
        delivery_address: deliveryAddress,
        delivery_fee: 20,
        status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price
    }))

    const { error: itemsError } = await (supabase as any)
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    return order
  }

  return {
    orders,
    fetchOrders,
    placeOrder
  }
}
