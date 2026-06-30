import { createRequire } from 'node:module'
import process from 'node:process'
import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as pgSchema from '../../../db/schema'
import * as sqliteSchema from '../../../db/schema.sqlite'

const _require = createRequire(import.meta.url)

export type DbDriver = 'sqlite' | 'postgres'
export type DbClient = ReturnType<typeof createDatabase>

let _db: DbClient | null = null

function createDatabase() {
  const driver = (process.env.DB_DRIVER || 'postgres') as DbDriver

  if (driver === 'sqlite') {
    const Database = _require('better-sqlite3')
    const { drizzle: drizzleSqlite } = _require('drizzle-orm/better-sqlite3')
    const dbPath = process.env.SQLITE_DB_PATH || './data/qcommerce.sqlite'
    const sqlite = new Database(dbPath)
    sqlite.pragma('journal_mode = WAL')
    sqlite.pragma('busy_timeout = 5000')
    sqlite.pragma('synchronous = NORMAL')
    sqlite.pragma('foreign_keys = ON')
    return {
      db: drizzleSqlite(sqlite) as ReturnType<typeof drizzleSqlite>,
      driver: 'sqlite' as const,
      schema: sqliteSchema,
    }
  }

  const connectionString = process.env.NUXT_SUPABASE_DB_URL || ''
  const client = postgres(connectionString, {
    max: 20,
    idle_timeout: 30,
    connect_timeout: 10,
    max_lifetime: 60 * 60,
    onnotice: () => {},
  })
  return {
    db: drizzlePg(client),
    driver: 'postgres' as const,
    schema: pgSchema,
  }
}

export function useDb() {
  if (!_db) _db = createDatabase()
  return _db
}
