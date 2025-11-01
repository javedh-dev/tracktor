import { logger } from "@config/index";
import { db } from "@db/index";
import { sql } from "drizzle-orm";

/**
 * Database patch to add missing columns to fuel_logs table
 * Adds 'filled' and 'missed_last' columns if they don't exist
 */
export async function applyPatches(): Promise<void> {
  try {
    logger.info("Starting database patches...");

    await addFuelLogColumns();

    logger.info("Database patches completed successfully");
  } catch (error) {
    logger.error("Error applying database patches:", error);
    throw error;
  }
}

/**
 * Add filled and missed_last columns to fuel_logs table if they don't exist
 */
async function addFuelLogColumns(): Promise<void> {
  try {
    // First check if the fuel_logs table exists
    const tableExists = await db.all(sql`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name='fuel_logs'
    `);

    if (tableExists.length === 0) {
      logger.info("fuel_logs table does not exist, skipping column patches");
      return;
    }

    // Check if columns exist by querying table info
    const tableInfo = await db.all(sql`PRAGMA table_info(fuel_logs)`);

    const existingColumns = tableInfo.map((col: any) => col.name);
    const hasFilledColumn = existingColumns.includes("filled");
    const hasMissedLastColumn = existingColumns.includes("missed_last");

    logger.info(`Found columns in fuel_logs: ${existingColumns.join(", ")}`);

    if (!hasFilledColumn) {
      logger.info("Adding 'filled' column to fuel_logs table...");
      try {
        await db.run(sql`
          ALTER TABLE fuel_logs
          ADD COLUMN filled INTEGER DEFAULT 1 NOT NULL
        `);
        logger.info("Successfully added 'filled' column");
      } catch (columnError) {
        if (
          columnError instanceof Error &&
          (columnError.message.includes("duplicate column name") ||
            columnError.message.includes("already exists"))
        ) {
          logger.info("Column 'filled' already exists, skipping...");
        } else {
          throw columnError;
        }
      }
    } else {
      logger.info("Column 'filled' already exists in fuel_logs table");
    }

    if (!hasMissedLastColumn) {
      logger.info("Adding 'missed_last' column to fuel_logs table...");
      try {
        await db.run(sql`
          ALTER TABLE fuel_logs
          ADD COLUMN missed_last INTEGER DEFAULT 0 NOT NULL
        `);
        logger.info("Successfully added 'missed_last' column");
      } catch (columnError) {
        if (
          columnError instanceof Error &&
          (columnError.message.includes("duplicate column name") ||
            columnError.message.includes("already exists"))
        ) {
          logger.info("Column 'missed_last' already exists, skipping...");
        } else {
          throw columnError;
        }
      }
    } else {
      logger.info("Column 'missed_last' already exists in fuel_logs table");
    }
  } catch (error) {
    logger.info("Error in addFuelLogColumns:", error);

    // Don't throw for non-critical errors to prevent app startup failure
    if (error instanceof Error) {
      logger.error(`Patch error details: ${error.message}`);
    }
  }
}

/**
 * Initialize and run all database patches
 * Call this function during application startup
 */
export async function initializePatches(): Promise<void> {
  try {
    await applyPatches();
  } catch (error) {
    console.error("Failed to initialize database patches:", error);
  }
}
