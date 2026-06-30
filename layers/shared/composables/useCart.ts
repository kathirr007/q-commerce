export const useCart = () => {
  const cart = useState<any[]>('cart', () => [])

  function addItem(item: any) {
    const existing = cart.value.find(i => i.product_id === item.product_id)
    if (existing) {
      existing.quantity += item.quantity
    } else {
      cart.value.push(item)
    }
  }

  function removeItem(productId: string) {
    cart.value = cart.value.filter(i => i.product_id !== productId)
  }

  function updateQuantity(productId: string, quantity: number) {
    const item = cart.value.find(i => i.product_id === productId)
    if (item) {
      item.quantity = quantity
    }
  }

  function clear() {
    cart.value = []
  }

  const totalItems = computed(() =>
    cart.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const totalAmount = computed(() =>
    cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  return {
    cart: readonly(cart),
    addItem,
    removeItem,
    updateQuantity,
    clear,
    totalItems,
    totalAmount
  }
}
