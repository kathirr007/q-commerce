import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import process from 'node:process'

const _require = createRequire(import.meta.url)

function runSqliteMigrations() {
  const dbPath = process.env.SQLITE_DB_PATH || './data/qcommerce.sqlite'
  mkdirSync(dirname(dbPath), { recursive: true })

  const Database = _require('better-sqlite3')
  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'customer',
      location TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stores (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      location TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      operating_hours TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      store_id TEXT NOT NULL REFERENCES stores(id),
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      images TEXT DEFAULT '[]',
      category_id TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id),
      store_id TEXT NOT NULL REFERENCES stores(id),
      stock_level INTEGER NOT NULL DEFAULT 0,
      reserved_stock INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      store_id TEXT NOT NULL REFERENCES stores(id),
      status TEXT NOT NULL DEFAULT 'pending',
      total REAL NOT NULL,
      delivery_address TEXT NOT NULL,
      delivery_fee REAL NOT NULL DEFAULT 20,
      payment_status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id),
      product_id TEXT NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS deliveries (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id),
      delivery_partner_id TEXT NOT NULL REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'assigned',
      pickup_time TEXT,
      delivered_time TEXT,
      route TEXT DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id),
      method TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      transaction_id TEXT,
      amount REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS delivery_partners (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'offline',
      current_location TEXT,
      vehicle_type TEXT NOT NULL
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

export default defineNitroPlugin(() => {
  const driver = process.env.DB_DRIVER || 'postgres'
  if (driver === 'sqlite') {
    runSqliteMigrations()
    console.log('[db] SQLite ready — ./data/qcommerce.sqlite')
  }
})
