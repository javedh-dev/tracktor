#!/usr/bin/env tsx

/**
 * Standalone script to seed the database
 * Usage: pnpm run db:seed
 */

import { seedData } from '../src/server/db/seeders';
import { logger } from '../src/server/config';

async function main() {
    try {
        logger.info('Starting database seeding...');
        await seedData();
        logger.info('Database seeding completed successfully');
        process.exit(0);
    } catch (error) {
        logger.error('Failed to seed database:', error);
        process.exit(1);
    }
}

main();