/**
 * Production migration runner.
 *
 * Problem: drizzle-kit CLI (`drizzle-kit migrate`) fails when the DB schema
 * already exists but the drizzle migrations journal table does not — it tries
 * to re-apply all CREATE TABLE statements which crash on existing tables.
 *
 * This script uses drizzle-orm's programmatic migrate() and bootstraps the
 * journal table with ALL previously applied migrations when the schema is
 * pre-existing, so that already-applied migrations are safely skipped.
 */

import { drizzle }       from 'drizzle-orm/node-postgres'
import { migrate }       from 'drizzle-orm/node-postgres/migrator'
import { Pool }          from 'pg'
import { createHash }    from 'node:crypto'
import { readFileSync }  from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname      = dirname(fileURLToPath(import.meta.url))
const MIGRATIONS_DIR = join(__dirname, '../lib/db/migrations')

const MIG_SCHEMA = 'drizzle'
const MIG_TABLE  = '__drizzle_migrations'

async function bootstrap(client) {
  // Only needed when the app schema is already present (manual / prior deploy)
  const { rows: schemaCheck } = await client.query(`
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'students'
  `)
  if (schemaCheck.length === 0) return // Fresh DB — let migrate() create everything

  // Ensure drizzle schema + journal table exist
  await client.query(`CREATE SCHEMA IF NOT EXISTS "${MIG_SCHEMA}"`)
  await client.query(`
    CREATE TABLE IF NOT EXISTS "${MIG_SCHEMA}"."${MIG_TABLE}" (
      id         SERIAL PRIMARY KEY,
      hash       TEXT   NOT NULL,
      created_at BIGINT
    )
  `)

  // Get timestamps already recorded in the journal
  const { rows: applied } = await client.query(
    `SELECT created_at FROM "${MIG_SCHEMA}"."${MIG_TABLE}" ORDER BY created_at`
  )
  const appliedTimestamps = new Set(applied.map(r => String(r.created_at)))

  // Read the local journal to find any entries not yet recorded
  const journal  = JSON.parse(readFileSync(join(MIGRATIONS_DIR, 'meta/_journal.json'), 'utf8'))
  let seededCount = 0

  for (const entry of journal.entries) {
    if (appliedTimestamps.has(String(entry.when))) continue // already recorded

    const sqlText = readFileSync(join(MIGRATIONS_DIR, `${entry.tag}.sql`), 'utf8')
    const hash    = createHash('sha256').update(sqlText).digest('hex')

    await client.query(
      `INSERT INTO "${MIG_SCHEMA}"."${MIG_TABLE}" (hash, created_at) VALUES ($1, $2)`,
      [hash, entry.when]
    )
    console.log(`  Seeded migration: ${entry.tag}`)
    seededCount++
  }

  if (seededCount > 0) {
    console.log(`Bootstrap complete — ${seededCount} migration(s) seeded.`)
  }
}

async function run() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10_000,
  })

  const client = await pool.connect()
  try {
    await bootstrap(client)
  } finally {
    client.release()
  }

  const db = drizzle(pool)
  try {
    await migrate(db, { migrationsFolder: MIGRATIONS_DIR })
    console.log('✓ Migrations complete')
  } finally {
    await pool.end()
  }
}

run().catch(err => {
  console.error('✗ Migration failed:', err.message)
  process.exit(1)
})
