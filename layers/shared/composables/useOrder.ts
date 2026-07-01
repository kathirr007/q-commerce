export const useOrder = () => {
  const orders = ref<any[]>([])

  async function fetchOrders() {
    const { data, error } = await useFetch('/api/orders')
    if (data.value) orders.value = data.value as any[]
    return orders.value
  }

  async function placeOrder(items: Array<{ product_id: string; quantity: number; unit_price: number }>, storeId: string, deliveryAddress: string) {
    const { data, error } = await useFetch('/api/orders', {
      method: 'POST',
      body: {
        store_id: storeId,
        delivery_address: deliveryAddress,
        items,
        payment_method: 'cod'
      }
    })

    if (error.value) throw new Error(error.value.statusMessage || 'Failed to place order')
    return data.value
  }

  async function getOrder(id: string) {
    const { data } = await useFetch(`/api/orders/${id}`)
    return data.value
  }

  return {
    orders,
    fetchOrders,
    placeOrder,
    getOrder
  }
}
