import { migrate } from 'drizzle-orm/libsql/migrator';
import { db } from './index';
import { seedData } from './seeders';
import { logger } from '$server/config';
import { resolve } from 'path';
import { applyPatches } from './patch';

/**
 * Initialize the database by running migrations and seeding data
 */
export async function initializeDatabase(): Promise<void> {
	try {
		logger.info('Initializing database...');

		// Run migrations
		logger.info('Running database migrations...');
		await migrate(db, {
			migrationsFolder: resolve(process.cwd(), 'migrations'),
			migrationsTable: '_migrations'
		});
		logger.info('Database migrations completed successfully');

		// Seed data if needed
		logger.info('Running data seeding if applicable...');
		await seedData();
		logger.info('Data seeding completed successfully');

		// Apply Patches if needed.
		logger.info('Running database patches if applicable..');
		await applyPatches();
		logger.info('Database patches applied successfully');
		logger.info('Database initialization completed successfully');
	} catch (error) {
		logger.error('Failed to initialize database:', error);
		throw error;
	}
}
