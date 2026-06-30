import { execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import prompts from 'prompts'

const ENV_PATH = resolve(process.cwd(), '.env')
const ENV_EXAMPLE_PATH = resolve(process.cwd(), '.env.example')

type Location = 'office' | 'home'

function readEnv(): string {
  return existsSync(ENV_PATH) ? readFileSync(ENV_PATH, 'utf-8') : ''
}

function getVar(content: string, key: string): string {
  return content.match(new RegExp(`^${key}=(.+)$`, 'm'))?.[1]?.trim() ?? ''
}

function setVar(content: string, key: string, value: string): string {
  const pattern = new RegExp(`^${key}=.*$`, 'm')
  return pattern.test(content)
    ? content.replace(pattern, `${key}=${value}`)
    : `${content}\n${key}=${value}`
}

async function main() {
  console.log('\n  Quick Commerce - Development Server\n')

  if (!existsSync(ENV_PATH) && existsSync(ENV_EXAMPLE_PATH)) {
    writeFileSync(ENV_PATH, readFileSync(ENV_EXAMPLE_PATH, 'utf-8'))
    console.log('  Created .env from .env.example\n')
  }

  let envContent = readEnv()

  const currentPort = getVar(envContent, 'PORT') || '3000'
  const currentLocation = (getVar(envContent, 'DEV_LOCATION') || 'office') as Location

  // --- Port ---
  const { port } = await prompts({
    type: 'number',
    name: 'port',
    message: 'Dev server port',
    initial: Number(currentPort),
    validate: v => (v > 0 && v < 65536) || 'Enter a valid port (1–65535)',
  })

  if (port === undefined) {
    console.log('\n  Cancelled.\n')
    process.exit(0)
  }

  // --- Location / database ---
  const { location } = await prompts({
    type: 'select',
    name: 'location',
    message: 'Select database',
    choices: [
      {
        title: 'Office  →  SQLite (local file, no network needed)',
        value: 'office',
        description: 'Data stored in ./data/qcommerce.sqlite',
      },
      {
        title: 'Home  →  Supabase (remote Postgres)',
        value: 'home',
        description: 'Connects to Supabase via the DB URL in your .env',
      },
    ],
    initial: currentLocation === 'home' ? 1 : 0,
  })

  if (!location) {
    console.log('\n  Cancelled.\n')
    process.exit(0)
  }

  const isHome = location === 'home'
  const dbDriver = isHome ? 'postgres' : 'sqlite'

  // For home: ensure the Supabase DB URL is set
  if (isHome) {
    const currentUrl = getVar(envContent, 'NUXT_SUPABASE_DB_URL')
    const isPlaceholder = !currentUrl || currentUrl.includes('your-')

    if (isPlaceholder) {
      const { dbUrl } = await prompts({
        type: 'text',
        name: 'dbUrl',
        message: 'Supabase DB URL  (Project Settings → Database → Connection string)',
        initial: 'postgresql://postgres:password@db.your-ref.supabase.co:5432/postgres',
        validate: v => v.startsWith('postgresql://') || 'Must start with postgresql://',
      })

      if (!dbUrl) {
        console.log('\n  Cancelled.\n')
        process.exit(0)
      }

      envContent = setVar(envContent, 'NUXT_SUPABASE_DB_URL', dbUrl)
    }
  }

  // --- Write .env ---
  envContent = setVar(envContent, 'PORT', String(port))
  envContent = setVar(envContent, 'DEV_LOCATION', location)
  envContent = setVar(envContent, 'DB_DRIVER', dbDriver)

  writeFileSync(ENV_PATH, envContent)

  const dbLabel = isHome ? 'Supabase (remote Postgres)' : 'SQLite (./data/qcommerce.sqlite)'
  console.log(`\n  Port     : ${port}`)
  console.log(`  Database : ${dbLabel}`)
  console.log('\n  Starting Nuxt dev server...\n')

  execSync(`pnpm nuxt dev --port ${port}`, {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: String(port),
      DB_DRIVER: dbDriver,
    },
  })
}

main().catch(console.error)
