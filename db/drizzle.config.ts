import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

const driver = process.env.DB_DRIVER || 'postgres'

export default driver === 'sqlite'
  ? defineConfig({
    dialect: 'sqlite',
    schema: './db/schema.sqlite.ts',
    out: './db/migrations/sqlite',
    dbCredentials: {
      url: process.env.SQLITE_DB_PATH || './data/qcommerce.sqlite',
    },
  })
  : defineConfig({
    dialect: 'postgresql',
    schema: './db/schema.ts',
    out: './db/migrations/pg',
    dbCredentials: {
      url: process.env.NUXT_SUPABASE_DB_URL || '',
    },
  })
