import { pgTable, uuid, text, integer, decimal, jsonb, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('role', ['customer', 'delivery', 'store_manager', 'admin'])
export const storeTypeEnum = pgEnum('store_type', ['dark_store', 'retail'])
export const storeStatusEnum = pgEnum('store_status', ['active', 'inactive'])
export const productStatusEnum = pgEnum('product_status', ['active', 'inactive'])
export const orderStatusEnum = pgEnum('order_status', ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'])
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'failed', 'refunded'])
export const paymentMethodEnum = pgEnum('payment_method', ['razorpay', 'cod'])
export const deliveryStatusEnum = pgEnum('delivery_status', ['assigned', 'picked_up', 'in_transit', 'delivered'])
export const partnerStatusEnum = pgEnum('partner_status', ['online', 'offline', 'busy'])
export const vehicleTypeEnum = pgEnum('vehicle_type', ['bike', 'scooter', 'car'])

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email').notNull().unique(),
  role: roleEnum('role').notNull().default('customer'),
  location: jsonb('location'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const stores = pgTable('stores', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: storeTypeEnum('type').notNull(),
  location: jsonb('location').notNull(),
  status: storeStatusEnum('status').notNull().default('active'),
  operatingHours: jsonb('operating_hours'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  storeId: uuid('store_id').notNull().references(() => stores.id),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  images: jsonb('images').default([]),
  categoryId: uuid('category_id'),
  status: productStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const inventory = pgTable('inventory', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id),
  storeId: uuid('store_id').notNull().references(() => stores.id),
  stockLevel: integer('stock_level').notNull().default(0),
  reservedStock: integer('reserved_stock').notNull().default(0)
})

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  storeId: uuid('store_id').notNull().references(() => stores.id),
  status: orderStatusEnum('status').notNull().default('pending'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  deliveryAddress: text('delivery_address').notNull(),
  deliveryFee: decimal('delivery_fee', { precision: 10, scale: 2 }).notNull().default('20'),
  paymentStatus: paymentStatusEnum('payment_status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull()
})

export const deliveries = pgTable('deliveries', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  deliveryPartnerId: uuid('delivery_partner_id').notNull().references(() => users.id),
  status: deliveryStatusEnum('status').notNull().default('assigned'),
  pickupTime: timestamp('pickup_time'),
  deliveredTime: timestamp('delivered_time'),
  route: jsonb('route').default([])
})

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  method: paymentMethodEnum('method').notNull(),
  status: paymentStatusEnum('status').notNull().default('pending'),
  transactionId: text('transaction_id'),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull()
})

export const deliveryPartners = pgTable('delivery_partners', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id).unique(),
  status: partnerStatusEnum('status').notNull().default('offline'),
  currentLocation: jsonb('current_location'),
  vehicleType: vehicleTypeEnum('vehicle_type').notNull()
})
