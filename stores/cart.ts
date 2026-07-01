import { defineStore } from 'pinia'

export interface CartItem {
  product_id: string
  name: string
  price: number
  quantity: number
  store_id: string
  image?: string
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[]
  }),

  getters: {
    totalItems: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount: (state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    storeId: (state) => state.items[0]?.store_id || null
  },

  actions: {
    addItem(item: CartItem) {
      const existing = this.items.find(i => i.product_id === item.product_id)
      if (existing) {
        existing.quantity += item.quantity
      } else {
        this.items.push(item)
      }
    },

    removeItem(productId: string) {
      this.items = this.items.filter(i => i.product_id !== productId)
    },

    updateQuantity(productId: string, quantity: number) {
      const item = this.items.find(i => i.product_id === productId)
      if (item) {
        if (quantity <= 0) {
          this.removeItem(productId)
        } else {
          item.quantity = quantity
        }
      }
    },

    clear() {
      this.items = []
    }
  }
})
