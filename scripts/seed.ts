import { seedData } from '../src/server/db/seeders/index';
import { logger } from '../src/server/config';

(async () => {
	try {
		logger.info('Starting database seeding...');
		await seedData();
		logger.info('Database seeding completed successfully');
		process.exit(0);
	} catch (error) {
		logger.error('Database seeding failed:', error);
		process.exit(1);
	}
})();
