import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import process from 'node:process'
import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as pgSchema from '../db/schema'
import * as sqliteSchema from '../db/schema.sqlite'

const _require = createRequire(import.meta.url)
const driver = (process.env.DB_DRIVER || 'sqlite') as 'sqlite' | 'postgres'

function ensureSqliteTables() {
  const dbPath = process.env.SQLITE_DB_PATH || './data/qcommerce.sqlite'
  mkdirSync(dirname(dbPath), { recursive: true })
  const Database = _require('better-sqlite3')
  const db = new Database(dbPath)
  db.pragma('foreign_keys = ON')
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT, email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'customer', location TEXT, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS stores (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL, location TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active', operating_hours TEXT, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY, store_id TEXT NOT NULL REFERENCES stores(id), name TEXT NOT NULL,
      description TEXT, price REAL NOT NULL, images TEXT DEFAULT '[]', category_id TEXT,
      status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY, product_id TEXT NOT NULL REFERENCES products(id),
      store_id TEXT NOT NULL REFERENCES stores(id),
      stock_level INTEGER NOT NULL DEFAULT 0, reserved_stock INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
      store_id TEXT NOT NULL REFERENCES stores(id),
      status TEXT NOT NULL DEFAULT 'pending', total REAL NOT NULL,
      delivery_address TEXT NOT NULL, delivery_fee REAL NOT NULL DEFAULT 20,
      payment_status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id),
      product_id TEXT NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL, unit_price REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS deliveries (
      id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id),
      delivery_partner_id TEXT NOT NULL REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'assigned', pickup_time TEXT, delivered_time TEXT, route TEXT DEFAULT '[]'
    );
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id),
      method TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
      transaction_id TEXT, amount REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS delivery_partners (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'offline', current_location TEXT, vehicle_type TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
    CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
    CREATE INDEX IF NOT EXISTS idx_inventory_store_id ON inventory(store_id);
  `)
  db.close()
}

function getDb() {
  if (driver === 'sqlite') {
    ensureSqliteTables()
    const Database = _require('better-sqlite3')
    const { drizzle: drizzleSqlite } = _require('drizzle-orm/better-sqlite3')
    const dbPath = process.env.SQLITE_DB_PATH || './data/qcommerce.sqlite'
    const sqlite = new Database(dbPath)
    sqlite.pragma('foreign_keys = ON')
    return { db: drizzleSqlite(sqlite), schema: sqliteSchema, driver: 'sqlite' as const }
  }

  const connectionString = process.env.NUXT_SUPABASE_DB_URL || ''
  const client = postgres(connectionString)
  return { db: drizzlePg(client), schema: pgSchema, driver: 'postgres' as const }
}

const { db, schema } = getDb()

function uuid() {
  return crypto.randomUUID()
}

function now() {
  return new Date().toISOString()
}

const CATEGORIES = [
  'groceries', 'dairy', 'snacks', 'beverages',
  'household', 'personal-care', 'baby', 'pet-supplies',
  'electronics', 'stationery'
]

async function seed() {
  console.log(`\n  Seeding database (driver: ${driver})...\n`)

  // ---------------------------------------------------------------------------
  // 1. USERS
  // ---------------------------------------------------------------------------
  console.log('  Creating users...')

  const adminId = uuid()
  const partnerId = uuid()
  const customerId = uuid()
  const customer2Id = uuid()

  await db.insert(schema.users).values([
    { id: adminId, name: 'Admin User', email: 'admin@qcommerce.com', phone: '+919000000001', role: 'admin', createdAt: now() },
    { id: partnerId, name: 'Ravi Kumar', email: 'ravi@qcommerce.com', phone: '+919000000002', role: 'delivery', createdAt: now() },
    { id: customerId, name: 'Priya Sharma', email: 'priya@example.com', phone: '+919000000003', role: 'customer', createdAt: now() },
    { id: customer2Id, name: 'Amit Patel', email: 'amit@example.com', phone: '+919000000004', role: 'customer', createdAt: now() },
  ])

  await db.insert(schema.deliveryPartners).values({
    id: uuid(),
    userId: partnerId,
    status: 'online',
    vehicleType: 'bike',
    currentLocation: JSON.stringify({ lat: 12.9716, lng: 77.5946 })
  })

  // ---------------------------------------------------------------------------
  // 2. STORES  (5 stores across Indian cities)
  // ---------------------------------------------------------------------------
  console.log('  Creating stores...')

  const stores = [
    { name: 'QuickMart Indiranagar', type: 'dark_store' as const, lat: 12.9719, lng: 77.6412, city: 'Bangalore' },
    { name: 'QuickMart Koramangala', type: 'dark_store' as const, lat: 12.9352, lng: 77.6245, city: 'Bangalore' },
    { name: 'QuickMart HSR Layout', type: 'retail' as const, lat: 12.9116, lng: 77.6389, city: 'Bangalore' },
    { name: 'QuickMart Connaught Place', type: 'dark_store' as const, lat: 28.6315, lng: 77.2167, city: 'Delhi' },
    { name: 'QuickMart Bandra', type: 'retail' as const, lat: 19.0596, lng: 72.8295, city: 'Mumbai' },
  ]

  const storeIds: string[] = []
  for (const s of stores) {
    const id = uuid()
    storeIds.push(id)
    await db.insert(schema.stores).values({
      id,
      name: s.name,
      type: s.type,
      location: JSON.stringify({ lat: s.lat, lng: s.lng, address: `${s.name}, ${s.city}` }),
      status: 'active',
      operatingHours: JSON.stringify({
        mon: '07:00-23:00', tue: '07:00-23:00', wed: '07:00-23:00',
        thu: '07:00-23:00', fri: '07:00-23:00', sat: '08:00-23:00', sun: '09:00-22:00'
      }),
      createdAt: now()
    })
  }

  // ---------------------------------------------------------------------------
  // 3. PRODUCTS  (~50 products across categories)
  // ---------------------------------------------------------------------------
  console.log('  Creating products...')

  interface ProductSeed {
    name: string
    description: string
    price: number
    category: string
  }

  const productSeeds: ProductSeed[] = [
    // Groceries
    { name: 'Basmati Rice (1kg)', description: 'Premium aged basmati rice, long grain', price: 120, category: 'groceries' },
    { name: 'Toor Dal (1kg)', description: 'Arhar dal, hygienically packed', price: 95, category: 'groceries' },
    { name: 'Wheat Flour Atta (5kg)', description: 'Whole wheat flour for soft rotis', price: 175, category: 'groceries' },
    { name: 'Fortune Sunflower Oil (1L)', description: 'Refined sunflower cooking oil', price: 165, category: 'groceries' },
    { name: 'Tata Salt (1kg)', description: 'Iodised table salt', price: 18, category: 'groceries' },
    { name: 'Turmeric Powder (100g)', description: 'Pure turmeric powder, no additives', price: 35, category: 'groceries' },
    { name: 'Red Chilli Powder (100g)', description: 'Kashmiri red chilli powder, mild spice', price: 42, category: 'groceries' },
    { name: 'Cumin Seeds Jeera (100g)', description: 'Premium whole cumin seeds', price: 28, category: 'groceries' },
    { name: 'Sugar (1kg)', description: 'Fine grain white sugar', price: 42, category: 'groceries' },
    { name: 'Pasta Penne (500g)', description: 'Italian durum wheat penne pasta', price: 65, category: 'groceries' },
    { name: 'Maggi Noodles (12 pack)', description: '2-minute instant noodles, masala flavor', price: 144, category: 'groceries' },
    { name: 'Oats (1kg)', description: 'Rolled oats, high fiber breakfast', price: 110, category: 'groceries' },

    // Dairy
    { name: 'Amul Fresh Milk (1L)', description: 'Toned milk, 3% fat', price: 56, category: 'dairy' },
    { name: 'Amul Butter (500g)', description: 'Salted butter block', price: 265, category: 'dairy' },
    { name: 'Greek Yogurt (400g)', description: 'Creamy Greek-style yogurt', price: 95, category: 'dairy' },
    { name: 'Cheddar Cheese (200g)', description: 'Processed cheddar cheese block', price: 160, category: 'dairy' },
    { name: 'Paneer Fresh (250g)', description: 'Fresh cottage cheese, comes in water', price: 85, category: 'dairy' },
    { name: 'Milk Powder (1kg)', description: 'Full cream milk powder', price: 420, category: 'dairy' },

    // Snacks
    { name: 'Lays Chips Sour Cream (52g)', description: 'American style sour cream & onion', price: 20, category: 'snacks' },
    { name: 'Lays Chips Magic Masala (52g)', description: 'Indian spice flavored potato chips', price: 20, category: 'snacks' },
    { name: 'Doritos Nachos Cheese (80g)', description: 'Cheese flavored tortilla chips', price: 35, category: 'snacks' },
    { name: 'Haldiram\'s Bhujia (200g)', description: 'Crispy gram flour snack', price: 50, category: 'snacks' },
    { name: 'Dark Chocolate (70% Cocoa)', description: 'Belgian dark chocolate bar, 100g', price: 199, category: 'snacks' },
    { name: 'Mixed Dry Fruits (400g)', description: 'Almonds, cashews, pistachios, raisins', price: 399, category: 'snacks' },
    { name: 'Granola Bar Pack (6 pcs)', description: 'Oats and honey baked bars', price: 120, category: 'snacks' },

    // Beverages
    { name: 'Coca Cola (750ml)', description: 'Classic cola carbonated drink', price: 40, category: 'beverages' },
    { name: 'Thums Up (750ml)', description: 'Strong cola carbonated drink', price: 40, category: 'beverages' },
    { name: 'Bisleri Water (1L)', description: 'Packaged drinking water', price: 22, category: 'beverages' },
    { name: 'Tropicana Orange Juice (1L)', description: 'Not from concentrate, 100% juice', price: 130, category: 'beverages' },
    { name: 'Green Tea Bags (25 pcs)', description: 'Jasmine flavored green tea bags', price: 95, category: 'beverages' },
    { name: 'Nescafe Instant Coffee (200g)', description: 'Premium instant coffee powder', price: 345, category: 'beverages' },
    { name: 'Red Bull Energy Drink (250ml)', description: 'Energy drink, sugar free option', price: 125, category: 'beverages' },

    // Household
    { name: 'Surf Excel Detergent (2kg)', description: 'Front-load washing machine powder', price: 320, category: 'household' },
    { name: 'Dishwashing Liquid (750ml)', description: 'Lemon scented dish soap', price: 95, category: 'household' },
    { name: 'Toilet Cleaner (500ml)', description: 'Thick liquid toilet bowl cleaner', price: 68, category: 'household' },
    { name: 'Trash Bags (30 pcs)', description: 'Medium 15L drawstring garbage bags', price: 49, category: 'household' },
    { name: 'Tissue Paper (6 boxes)', description: '3-ply facial tissue, 200 pulls each', price: 299, category: 'household' },
    { name: 'Mosquito Repellent (4 pcs)', description: 'Electric vaporizer refill, 45 nights', price: 145, category: 'household' },

    // Personal Care
    { name: 'Colgate Toothpaste (150g)', description: 'Advanced whitening toothpaste', price: 85, category: 'personal-care' },
    { name: 'Dove Soap Bath (4 pcs)', description: 'Moisturizing cream beauty bar', price: 160, category: 'personal-care' },
    { name: 'Head & Shoulders Shampoo (200ml)', description: 'Anti-dandruff shampoo, cool menthol', price: 189, category: 'personal-care' },
    { name: 'Nivea Body Lotion (400ml)', description: 'Aloe vera moisturizing lotion', price: 225, category: 'personal-care' },
    { name: 'Face Mask Sheet (5 pcs)', description: 'Hydrating hyaluronic acid face mask', price: 175, category: 'personal-care' },
    { name: 'Sunscreen SPF 50 (100ml)', description: 'Water resistant sunscreen lotion', price: 299, category: 'personal-care' },
    { name: 'Hand Sanitizer (500ml)', description: 'Alcohol based, 70%, with moisturizer', price: 89, category: 'personal-care' },

    // Baby
    { name: 'Diapers Size M (48 pcs)', description: 'Ultra dry baby diapers, medium 7-12kg', price: 499, category: 'baby' },
    { name: 'Baby Wipes (80 pcs)', description: 'Alcohol-free, aloe vera wet wipes', price: 149, category: 'baby' },
    { name: 'Baby Cereal (300g)', description: 'Multigrain baby cereal, 6+ months', price: 135, category: 'baby' },

    // Pet Supplies
    { name: 'Dog Dry Food Chicken (3kg)', description: 'Complete nutrition adult dog food', price: 599, category: 'pet-supplies' },
    { name: 'Cat Wet Food Tuna (85g)', description: 'Tuna flavour in jelly, 12 pack', price: 240, category: 'pet-supplies' },

    // Electronics
    { name: 'USB-C Charging Cable (1m)', description: 'Braided fast charging USB-C cable', price: 199, category: 'electronics' },
    { name: 'Wireless Mouse', description: 'Ergonomic 2.4GHz wireless mouse', price: 499, category: 'electronics' },
    { name: 'Smartphone Stand', description: 'Adjustable aluminum phone stand', price: 349, category: 'electronics' },

    // Stationery
    { name: 'Ball Pen Pack (10 pcs)', description: 'Smooth writing blue ink pens', price: 50, category: 'stationery' },
    { name: 'A4 Notebook Ruled (200 pg)', description: 'Hardbound ruled notebook', price: 85, category: 'stationery' },
  ]

  const productIds: string[] = []
  for (let i = 0; i < productSeeds.length; i++) {
    const p = productSeeds[i]
    const id = uuid()
    productIds.push(id)
    const si = i % storeIds.length

    await db.insert(schema.products).values({
      id,
      storeId: storeIds[si],
      name: p.name,
      description: p.description,
      price: p.price,
      images: JSON.stringify([]),
      categoryId: p.category,
      status: 'active',
      createdAt: now()
    })

    await db.insert(schema.inventory).values({
      id: uuid(),
      productId: id,
      storeId: storeIds[si],
      stockLevel: Math.floor(Math.random() * 80) + 10,
      reservedStock: 0
    })
  }

  // ---------------------------------------------------------------------------
  // 4. SAMPLE ORDERS
  // ---------------------------------------------------------------------------
  console.log('  Creating sample orders...')

  const orderStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'] as const
  const deliveryAddresses = [
    'Priya Sharma, +919000000003, 12th Main Road, Indiranagar, Bangalore - 560038',
    'Amit Patel, +919000000004, 5th Cross, Koramangala, Bangalore - 560095',
    'Priya Sharma, +919000000003, HSR Layout Sector 1, Bangalore - 560102',
  ]

  for (let i = 0; i < 12; i++) {
    const orderId = uuid()
    const storeId = storeIds[i % storeIds.length]
    const isCustomer1 = i % 2 === 0
    const userId = isCustomer1 ? customerId : customer2Id
    const numItems = (i % 4) + 1
    const status = orderStatuses[i % orderStatuses.length]
    const paymentStatus = status === 'cancelled' ? 'refunded' : status === 'delivered' ? 'paid' : 'pending'

    const orderItems: Array<{ productId: string; quantity: number; unitPrice: number }> = []
    let total = 0

    const usedIndices = new Set<number>()
    for (let j = 0; j < numItems; j++) {
      let pi: number
      do { pi = Math.floor(Math.random() * productSeeds.length) } while (usedIndices.has(pi))
      usedIndices.add(pi)

      const qty = Math.floor(Math.random() * 3) + 1
      const up = productSeeds[pi].price
      orderItems.push({ productId: productIds[pi], quantity: qty, unitPrice: up })
      total += up * qty
    }

    const createdAt = new Date(Date.now() - (12 - i) * 3600000).toISOString()

    await db.insert(schema.orders).values({
      id: orderId,
      userId,
      storeId,
      status,
      total: total + 20,
      deliveryAddress: deliveryAddresses[i % deliveryAddresses.length],
      deliveryFee: 20,
      paymentStatus,
      createdAt
    })

    for (const oi of orderItems) {
      await db.insert(schema.orderItems).values({
        id: uuid(),
        orderId,
        productId: oi.productId,
        quantity: oi.quantity,
        unitPrice: oi.unitPrice
      })
    }

    await db.insert(schema.payments).values({
      id: uuid(),
      orderId,
      method: i % 3 === 0 ? 'razorpay' : 'cod',
      status: paymentStatus === 'paid' ? 'paid' : paymentStatus === 'refunded' ? 'refunded' : 'pending',
      transactionId: i % 3 === 0 ? `txn_${uuid().slice(0, 12)}` : null,
      amount: total + 20
    })

    if (status === 'out_for_delivery' || status === 'delivered') {
      await db.insert(schema.deliveries).values({
        id: uuid(),
        orderId,
        deliveryPartnerId: partnerId,
        status: status === 'delivered' ? 'delivered' : 'in_transit',
        pickupTime: new Date(Date.now() - (12 - i) * 3600000 + 1800000).toISOString(),
        deliveredTime: status === 'delivered' ? new Date(Date.now() - (12 - i) * 3600000 + 5400000).toISOString() : null,
        route: JSON.stringify([{ lat: 12.9716, lng: 77.5946 }])
      })
    }
  }

  console.log(`\n  Seed complete!`)
  console.log(`  Users:    4`)
  console.log(`  Stores:   ${stores.length}`)
  console.log(`  Products: ${productSeeds.length}`)
  console.log(`  Orders:   12`)
  console.log(`\n  Login emails: admin@qcommerce.com, priya@example.com, ravi@qcommerce.com`)
  console.log(`  (Auth via Supabase — sign up matching emails in Supabase Auth UI)\n`)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
