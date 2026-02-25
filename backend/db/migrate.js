import 'dotenv/config';
import { pool } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_DIR = path.resolve(__dirname, 'migrations');
const TRACKING_TABLE = 'schema_migrations';

async function ensureTrackingTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${TRACKING_TABLE} (
      name VARCHAR(255) PRIMARY KEY,
      run_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

async function getAppliedMigrations(client) {
  const res = await client.query(
    `SELECT name FROM ${TRACKING_TABLE} ORDER BY name`
  );
  return new Set(res.rows.map((r) => r.name));
}

function getMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error(`Migrations directory not found: ${MIGRATIONS_DIR}`);
    return [];
  }
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();
  return files;
}

/**
 * Run SQL that may contain multiple statements.
 * PostgreSQL accepts multiple statements in one query; if that fails, run one by one.
 */
async function runSql(client, sql, migrationName) {
  const trimmed = sql.trim();
  if (!trimmed) return;

  try {
    await client.query(trimmed);
  } catch (oneErr) {
    // If "multiple statements" or similar, try splitting and running each
    if (/multiple statements|cannot execute.*multiple/i.test(oneErr.message)) {
      const statements = trimmed
        .split(/;\s*\n/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith('--'));
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i].endsWith(';') ? statements[i] : statements[i] + ';';
        try {
          await client.query(stmt);
        } catch (e) {
          console.error(`Statement ${i + 1}/${statements.length} failed:`, stmt.slice(0, 80) + '...');
          throw e;
        }
      }
    } else {
      throw oneErr;
    }
  }
}

async function runMigration(client, name, sql) {
  await client.query('BEGIN');
  try {
    await runSql(client, sql, name);
    await client.query(
      `INSERT INTO ${TRACKING_TABLE} (name) VALUES ($1)`,
      [name]
    );
    await client.query('COMMIT');
    console.log(`  ✓ ${name}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`  ✗ ${name}:`, err.message);
    throw err;
  }
}

async function migrate() {
  console.log('Migrations dir:', MIGRATIONS_DIR);

  const files = getMigrationFiles();
  if (files.length === 0) {
    console.log('No .sql files found in migrations directory. Exiting.');
    process.exit(1);
  }
  console.log('Migration files found:', files.length, '->', files.join(', '));

  const client = await pool.connect();
  try {
    await ensureTrackingTable(client);
    const applied = await getAppliedMigrations(client);
    const pending = files.filter((f) => !applied.has(f));

    if (pending.length === 0) {
      console.log('No pending migrations. Already applied:', [...applied].join(', '));
      return;
    }

    console.log(`Running ${pending.length} migration(s)...`);
    for (const file of pending) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      await runMigration(client, file, sql);
    }
    console.log('Done.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
