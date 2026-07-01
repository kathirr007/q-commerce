export const useDelivery = () => {
  async function trackDelivery(orderId: string) {
    const { data } = await useFetch(`/api/deliveries/${orderId}`)
    return data.value
  }

  return {
    trackDelivery
  }
}
