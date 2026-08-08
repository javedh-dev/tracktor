import { migrate } from 'drizzle-orm/libsql/migrator';
import { db } from './index';
import { seedData } from './seeders';
import { logger } from '$server/config';
import { resolve } from 'path';
import { env } from '$lib/config/env.server';

/**
 * Initialize the database by running migrations and seeding data
 */
export async function initializeDatabase(): Promise<void> {
  try {
    logger.info('Initializing database...');

    // Run migrations
    const migrationsFolder = resolve(
      env.RUNTIME.toLowerCase() === 'docker' ? process.cwd() : 'src/server/db',
      'migrations'
    );
    logger.info(`Running database migrations in \`${migrationsFolder}\`...`);
    await migrate(db, {
      migrationsFolder: migrationsFolder,
      migrationsTable: '_migrations'
    });
    logger.info('Database migrations completed successfully');

    // Seed data if needed
    logger.info('Running data seeding if applicable...');
    await seedData();
    logger.info('Data seeding completed successfully');
    logger.info('Database initialization completed successfully');
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    throw error;
  }
}
