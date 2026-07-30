import { logger } from '$server/config/index';
import { db } from '$server/db/index';
import { sql } from 'drizzle-orm';

/**
 * Database patch to add missing columns to fuel_logs table
 * Adds 'filled' and 'missed_last' columns if they don't exist
 */
export async function applyPatches(): Promise<void> {
  try {
    await addFuelLogColumns();
    await addOidcColumns();
  } catch (error) {
    logger.error('Error while applying database patches : ', error);
    throw error;
  }
}

/**
 * Add filled and missed_last columns to fuel_logs table if they don't exist
 */
async function addFuelLogColumns(): Promise<void> {
  // First check if the fuel_logs table exists
  const tableExists = await db.all(
    sql`SELECT name FROM sqlite_master WHERE type='table' AND name='fuel_logs'`
  );

  if (tableExists.length === 0) {
    return;
  }

  // Check if columns exist by querying table info
  const tableInfo = await db.all(sql`PRAGMA table_info(fuel_logs)`);

  const existingColumns = tableInfo.map((col: any) => col.name);
  const hasFilledColumn = existingColumns.includes('filled');
  const hasMissedLastColumn = existingColumns.includes('missed_last');

  if (!hasFilledColumn) {
    logger.info("Adding 'filled' column to fuel_logs table...");
    await db.run(sql`ALTER TABLE fuel_logs ADD COLUMN filled INTEGER DEFAULT 1 NOT NULL`);
    logger.info("Successfully added 'filled' column");
  }

  if (!hasMissedLastColumn) {
    logger.info("Adding 'missed_last' column to fuel_logs table...");
    await db.run(sql`ALTER TABLE fuel_logs ADD COLUMN missed_last INTEGER DEFAULT 0 NOT NULL`);
    logger.info("Successfully added 'missed_last' column");
  }
}

async function addOidcColumns(): Promise<void> {
  const tableExists = await db.all(
    sql`SELECT name FROM sqlite_master WHERE type='table' AND name='users'`
  );

  if (tableExists.length === 0) {
    return;
  }

  const tableInfo = await db.all(sql`PRAGMA table_info(users)`);

  const existingColumns = tableInfo.map((col: any) => col.name);
  const hasOidcId = existingColumns.includes('oidc_id');
  const hasOidcProvider = existingColumns.includes('oidc_provider');

  if (!hasOidcId) {
    logger.info("Adding 'oidc_id' column to users table...");
    await db.run(sql`ALTER TABLE users ADD COLUMN oidc_id TEXT`);
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS users_oidc_id_idx ON users(oidc_id)`);
    logger.info("Successfully added 'oidc_id' column");
  }

  if (!hasOidcProvider) {
    logger.info("Adding 'oidc_provider' column to users table...");
    await db.run(sql`ALTER TABLE users ADD COLUMN oidc_provider TEXT`);
    logger.info("Successfully added 'oidc_provider' column");
  }
}
