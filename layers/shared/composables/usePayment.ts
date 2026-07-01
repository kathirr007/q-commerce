export const usePayment = () => {
  async function createPayment(orderId: string, amount: number, method: 'razorpay' | 'cod' = 'cod') {
    const { data, error } = await useFetch('/api/payments', {
      method: 'POST',
      body: {
        order_id: orderId,
        method,
        amount
      }
    })

    if (error.value) throw new Error(error.value.statusMessage || 'Payment failed')
    return data.value
  }

  return {
    createPayment
  }
}
