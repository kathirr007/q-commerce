export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          phone: string | null
          email: string
          role: 'customer' | 'delivery' | 'store_manager' | 'admin'
          location: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          phone?: string | null
          email: string
          role?: 'customer' | 'delivery' | 'store_manager' | 'admin'
          location?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string | null
          email?: string
          role?: 'customer' | 'delivery' | 'store_manager' | 'admin'
          location?: Json | null
          created_at?: string
        }
      }
      stores: {
        Row: {
          id: string
          name: string
          type: 'dark_store' | 'retail'
          location: Json
          status: 'active' | 'inactive'
          operating_hours: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'dark_store' | 'retail'
          location: Json
          status?: 'active' | 'inactive'
          operating_hours?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'dark_store' | 'retail'
          location?: Json
          status?: 'active' | 'inactive'
          operating_hours?: Json | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          store_id: string
          name: string
          description: string | null
          price: string
          images: Json | null
          category_id: string | null
          status: 'active' | 'inactive'
          created_at: string
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          description?: string | null
          price: string
          images?: Json | null
          category_id?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          name?: string
          description?: string | null
          price?: string
          images?: Json | null
          category_id?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
        }
      }
      inventory: {
        Row: {
          id: string
          product_id: string
          store_id: string
          stock_level: number
          reserved_stock: number
        }
        Insert: {
          id?: string
          product_id: string
          store_id: string
          stock_level?: number
          reserved_stock?: number
        }
        Update: {
          id?: string
          product_id?: string
          store_id?: string
          stock_level?: number
          reserved_stock?: number
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          store_id: string
          status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'
          total: string
          delivery_address: string
          delivery_fee: string
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          store_id: string
          status?: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'
          total: string
          delivery_address: string
          delivery_fee?: string
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          store_id?: string
          status?: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'
          total?: string
          delivery_address?: string
          delivery_fee?: string
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          created_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: string
        }
      }
      deliveries: {
        Row: {
          id: string
          order_id: string
          delivery_partner_id: string
          status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered'
          pickup_time: string | null
          delivered_time: string | null
          route: Json | null
        }
        Insert: {
          id?: string
          order_id: string
          delivery_partner_id: string
          status?: 'assigned' | 'picked_up' | 'in_transit' | 'delivered'
          pickup_time?: string | null
          delivered_time?: string | null
          route?: Json | null
        }
        Update: {
          id?: string
          order_id?: string
          delivery_partner_id?: string
          status?: 'assigned' | 'picked_up' | 'in_transit' | 'delivered'
          pickup_time?: string | null
          delivered_time?: string | null
          route?: Json | null
        }
      }
      payments: {
        Row: {
          id: string
          order_id: string
          method: 'razorpay' | 'cod'
          status: 'pending' | 'paid' | 'failed' | 'refunded'
          transaction_id: string | null
          amount: string
        }
        Insert: {
          id?: string
          order_id: string
          method: 'razorpay' | 'cod'
          status?: 'pending' | 'paid' | 'failed' | 'refunded'
          transaction_id?: string | null
          amount: string
        }
        Update: {
          id?: string
          order_id?: string
          method?: 'razorpay' | 'cod'
          status?: 'pending' | 'paid' | 'failed' | 'refunded'
          transaction_id?: string | null
          amount?: string
        }
      }
      delivery_partners: {
        Row: {
          id: string
          user_id: string
          status: 'online' | 'offline' | 'busy'
          current_location: Json | null
          vehicle_type: 'bike' | 'scooter' | 'car'
        }
        Insert: {
          id?: string
          user_id: string
          status?: 'online' | 'offline' | 'busy'
          current_location?: Json | null
          vehicle_type: 'bike' | 'scooter' | 'car'
        }
        Update: {
          id?: string
          user_id?: string
          status?: 'online' | 'offline' | 'busy'
          current_location?: Json | null
          vehicle_type?: 'bike' | 'scooter' | 'car'
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      role: 'customer' | 'delivery' | 'store_manager' | 'admin'
      store_type: 'dark_store' | 'retail'
      store_status: 'active' | 'inactive'
      product_status: 'active' | 'inactive'
      order_status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'
      payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
      payment_method: 'razorpay' | 'cod'
      delivery_status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered'
      partner_status: 'online' | 'offline' | 'busy'
      vehicle_type: 'bike' | 'scooter' | 'car'
    }
    CompositeTypes: Record<string, never>
  }
}
