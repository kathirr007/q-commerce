import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email').notNull().unique(),
  role: text('role', { enum: ['customer', 'delivery', 'store_manager', 'admin'] }).notNull().default('customer'),
  location: text('location', { mode: 'json' }),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const stores = sqliteTable('stores', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  type: text('type', { enum: ['dark_store', 'retail'] }).notNull(),
  location: text('location', { mode: 'json' }).notNull(),
  status: text('status', { enum: ['active', 'inactive'] }).notNull().default('active'),
  operatingHours: text('operating_hours', { mode: 'json' }),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const products = sqliteTable('products', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  storeId: text('store_id').notNull().references(() => stores.id),
  name: text('name').notNull(),
  description: text('description'),
  price: real('price').notNull(),
  images: text('images', { mode: 'json' }).default('[]'),
  categoryId: text('category_id'),
  status: text('status', { enum: ['active', 'inactive'] }).notNull().default('active'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const inventory = sqliteTable('inventory', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: text('product_id').notNull().references(() => products.id),
  storeId: text('store_id').notNull().references(() => stores.id),
  stockLevel: integer('stock_level').notNull().default(0),
  reservedStock: integer('reserved_stock').notNull().default(0),
})

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
  storeId: text('store_id').notNull().references(() => stores.id),
  status: text('status', { enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'] }).notNull().default('pending'),
  total: real('total').notNull(),
  deliveryAddress: text('delivery_address').notNull(),
  deliveryFee: real('delivery_fee').notNull().default(20),
  paymentStatus: text('payment_status', { enum: ['pending', 'paid', 'failed', 'refunded'] }).notNull().default('pending'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text('order_id').notNull().references(() => orders.id),
  productId: text('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
})

export const deliveries = sqliteTable('deliveries', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text('order_id').notNull().references(() => orders.id),
  deliveryPartnerId: text('delivery_partner_id').notNull().references(() => users.id),
  status: text('status', { enum: ['assigned', 'picked_up', 'in_transit', 'delivered'] }).notNull().default('assigned'),
  pickupTime: text('pickup_time'),
  deliveredTime: text('delivered_time'),
  route: text('route', { mode: 'json' }).default('[]'),
})

export const payments = sqliteTable('payments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text('order_id').notNull().references(() => orders.id),
  method: text('method', { enum: ['razorpay', 'cod'] }).notNull(),
  status: text('status', { enum: ['pending', 'paid', 'failed', 'refunded'] }).notNull().default('pending'),
  transactionId: text('transaction_id'),
  amount: real('amount').notNull(),
})

export const deliveryPartners = sqliteTable('delivery_partners', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id).unique(),
  status: text('status', { enum: ['online', 'offline', 'busy'] }).notNull().default('offline'),
  currentLocation: text('current_location', { mode: 'json' }),
  vehicleType: text('vehicle_type', { enum: ['bike', 'scooter', 'car'] }).notNull(),
})
