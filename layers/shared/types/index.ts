export interface User {
  id: string
  name: string
  phone: string
  email: string
  role: 'customer' | 'delivery' | 'store_manager' | 'admin'
  location?: { lat: number; lng: number }
}

export interface Store {
  id: string
  name: string
  type: 'dark_store' | 'retail'
  location: { lat: number; lng: number }
  status: 'active' | 'inactive'
  operating_hours: Record<string, string>
}

export interface Product {
  id: string
  store_id: string
  name: string
  description: string
  price: number
  images: string[]
  category_id: string
  status: 'active' | 'inactive'
  inventory?: Inventory
}

export interface Inventory {
  id: string
  product_id: string
  store_id: string
  stock_level: number
  reserved_stock: number
}

export interface CartItem {
  product_id: string
  name: string
  price: number
  quantity: number
  store_id: string
}

export interface Order {
  id: string
  user_id: string
  store_id: string
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'
  total: number
  delivery_address: string
  delivery_fee: number
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  created_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
}

export interface Delivery {
  id: string
  order_id: string
  delivery_partner_id: string
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered'
  pickup_time: string
  delivered_time: string
  route: { lat: number; lng: number }[]
}

export interface Payment {
  id: string
  order_id: string
  method: 'razorpay' | 'cod'
  status: 'pending' | 'success' | 'failed'
  transaction_id: string
  amount: number
}

export interface DeliveryPartner {
  id: string
  user_id: string
  status: 'online' | 'offline' | 'busy'
  current_location: { lat: number; lng: number }
  vehicle_type: 'bike' | 'scooter' | 'car'
}
