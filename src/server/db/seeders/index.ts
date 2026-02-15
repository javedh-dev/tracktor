import {
	fuelLogTable,
	insuranceTable,
	maintenanceLogTable,
	pollutionCertificateTable,
	vehicleTable,
	notificationTable,
	configTable
} from '$server/db/schema/index';
import { createOrUpdateUser } from '$server/services/authService';
import { db } from '$server/db/index';
import { faker } from '@faker-js/faker';
import { env } from '$lib/config/env.server';
import { logger } from '$server/config';

export const seedData = async () => {
	logger.debug('Seeding data ', {
		FORCE_DATA_SEED: env.FORCE_DATA_SEED,
		DEMO_MODE: env.DEMO_MODE
	});

	// Always seed default config values
	await seedDefaultConfig();

	if (env.DEMO_MODE && env.NODE_ENV !== 'test') await seedDemoData(env.FORCE_DATA_SEED);
};

const seedDefaultConfig = async () => {
	const defaultConfigs = [
		{ key: 'cronJobsEnabled', value: 'true', description: 'Enable/disable all cron jobs globally' },
		{
			key: 'cronRemindersEnabled',
			value: 'true',
			description: 'Enable/disable reminder processing cron job'
		},
		{
			key: 'cronRemindersSchedule',
			value: '0 * * * *',
			description: 'Cron schedule for reminder processing (every hour)'
		},
		{
			key: 'cronInsuranceEnabled',
			value: 'true',
			description: 'Enable/disable insurance expiry cron job'
		},
		{
			key: 'cronInsuranceSchedule',
			value: '0 8 * * *',
			description: 'Cron schedule for insurance expiry (daily at 8:00 AM)'
		},
		{
			key: 'cronPuccEnabled',
			value: 'true',
			description: 'Enable/disable PUCC expiry cron job'
		},
		{
			key: 'cronPuccSchedule',
			value: '30 8 * * *',
			description: 'Cron schedule for PUCC expiry (daily at 8:30 AM)'
		},
		{
			key: 'cronCleanupEnabled',
			value: 'true',
			description: 'Enable/disable notification cleanup cron job'
		},
		{
			key: 'cronCleanupSchedule',
			value: '0 2 * * *',
			description: 'Cron schedule for notification cleanup (daily at 2:00 AM)'
		}
	];

	for (const config of defaultConfigs) {
		try {
			// Check if config already exists
			const existing = await db.query.configTable.findFirst({
				where: (c, { eq }) => eq(c.key, config.key)
			});

			if (!existing) {
				await db.insert(configTable).values(config);
				logger.debug(`Seeded default config: ${config.key}`);
			}
		} catch (error) {
			logger.error(`Failed to seed config ${config.key}:`, error);
		}
	}

	logger.info('Default config values seeded');
};

const seedDefaultUser = async () => {
	await createOrUpdateUser('demo', 'demo');
	logger.info('Default demo user created!!!');
};

export const clearDb = async () => {
	await db.delete(notificationTable);
	await db.delete(pollutionCertificateTable);
	await db.delete(maintenanceLogTable);
	await db.delete(fuelLogTable);
	await db.delete(insuranceTable);
	await db.delete(vehicleTable);
};

const seedDemoData = async (enforce: boolean = false) => {
	if (!env.DISABLE_AUTH) seedDefaultUser();
	if (!enforce) {
		const existingVehicles = await db.$count(vehicleTable);
		if (existingVehicles > 0) {
			logger.info('Demo data already exists, skipping');
			return;
		}
	} else {
		logger.warn('Forcing demo data seed. Deleting existing data...');
		await clearDb();
	}

	const vehicles = await db
		.insert(vehicleTable)
		.values([
			{
				make: faker.vehicle.manufacturer(),
				model: faker.vehicle.model(),
				year: faker.number.int({ min: 2000, max: 2025 }),
				licensePlate: faker.vehicle.vrm(),
				vin: faker.vehicle.vin(),
				color: faker.color.rgb(),
				odometer: faker.number.int({ min: 100, max: 500000 })
			},
			{
				make: faker.vehicle.manufacturer(),
				model: faker.vehicle.model(),
				year: faker.number.int({ min: 2000, max: 2025 }),
				licensePlate: faker.vehicle.vrm(),
				vin: faker.vehicle.vin(),
				color: faker.color.rgb(),
				odometer: faker.number.int({ min: 100, max: 500000 })
			}
		])
		.returning();

	vehicles.forEach(async (vehicle) => {
		const recurrenceTypes = ['none', 'yearly', 'monthly', 'no_end'];
		const recurrenceType = faker.helpers.arrayElement(recurrenceTypes);
		await db
			.insert(insuranceTable)
			.values({
				vehicleId: vehicle.id,
				provider: faker.company.name(),
				policyNumber: faker.string.numeric({ length: { min: 12, max: 18 } }),
				startDate: faker.date.past({ years: 1 }).toDateString(),
				endDate: recurrenceType !== 'none' ? null : faker.date.future({ years: 1 }).toDateString(),
				recurrenceType: recurrenceType,
				recurrenceInterval:
					recurrenceType === 'none' || recurrenceType === 'no_end'
						? 1
						: faker.number.int({ min: 1, max: 3 }),
				cost: faker.number.int({ min: 1000, max: 5000 })
			})
			.run();
	});

	vehicles.forEach(async (vehicle) => {
		await db
			.insert(maintenanceLogTable)
			.values({
				vehicleId: vehicle.id,
				date: faker.date.past({ years: 5 }).toDateString(),
				odometer: faker.number.int({ min: 100, max: 50000 }),
				serviceCenter: faker.company.name(),
				cost: faker.number.int({ min: 1000, max: 5000 })
			})
			.run();
	});

	vehicles.forEach(async (vehicle) => {
		const recurrenceTypes = ['none', 'yearly', 'monthly', 'no_end'];
		const recurrenceType = faker.helpers.arrayElement(recurrenceTypes);
		await db
			.insert(pollutionCertificateTable)
			.values({
				vehicleId: vehicle.id,
				certificateNumber: faker.string.alphanumeric({
					casing: 'upper',
					length: 10
				}),
				issueDate: faker.date.past({ years: 1 }).toDateString(),
				expiryDate:
					recurrenceType !== 'none' ? null : faker.date.future({ years: 1 }).toDateString(),
				recurrenceType: recurrenceType,
				recurrenceInterval:
					recurrenceType === 'none' || recurrenceType === 'no_end'
						? 1
						: faker.number.int({ min: 1, max: 2 }),
				testingCenter: faker.company.name()
			})
			.run();
	});

	vehicles.forEach(async (vehicle) => {
		const fuelLogs = [];
		for (let i = 0; i < 25; i++) {
			fuelLogs.push({
				vehicleId: vehicle.id,
				date: faker.date.recent({ days: 90 }).toDateString(),
				odometer: faker.number.int({
					min: vehicle.odometer!,
					max: vehicle.odometer! + 5000
				}),
				fuelAmount: faker.number.float({ min: 10, max: 25 }),
				cost: faker.number.float({ min: 10, max: 10000 }),
				filled: faker.datatype.boolean({ probability: 0.9 }),
				missedLast: faker.datatype.boolean({ probability: 0.1 })
			});
		}
		await db.insert(fuelLogTable).values(fuelLogs);
	});

	// Seed notifications for demo mode
	vehicles.forEach(async (vehicle) => {
		const notifications = [];
		const notificationTypes = ['reminder', 'alert', 'maintenance', 'insurance', 'pollution'];
		const sources = ['system', 'auto'];

		// Create 5-8 notifications per vehicle with varying read states and due dates
		const notificationCount = faker.number.int({ min: 5, max: 8 });

		for (let i = 0; i < notificationCount; i++) {
			const type = faker.helpers.arrayElement(notificationTypes);
			const daysOffset = faker.number.int({ min: -15, max: 30 }); // Past overdue to future
			const dueDate = new Date();
			dueDate.setDate(dueDate.getDate() + daysOffset);

			let message = '';
			switch (type) {
				case 'reminder':
					message = `Reminder: ${faker.helpers.arrayElement(['Oil change', 'Tire rotation', 'Brake inspection', 'Filter replacement'])} due`;
					break;
				case 'maintenance':
					message = `Scheduled maintenance: ${faker.helpers.arrayElement(['Annual service', 'Engine checkup', 'Transmission service', 'Coolant flush'])}`;
					break;
				case 'insurance':
					message = `Insurance renewal due for policy ${faker.string.alphanumeric({ length: 8, casing: 'upper' })}`;
					break;
				case 'pollution':
					message = `Pollution certificate expiring soon - visit testing center`;
					break;
				case 'alert':
					message = faker.helpers.arrayElement([
						'Vehicle registration renewal required',
						'Safety inspection overdue',
						'Tax payment reminder',
						'Document verification pending'
					]);
					break;
			}

			notifications.push({
				vehicleId: vehicle.id,
				type,
				message,
				source: faker.helpers.arrayElement(sources),
				dueDate: dueDate.toISOString(),
				isRead: faker.datatype.boolean({ probability: 0.3 }) ? 1 : 0 // 30% chance of being read
			});
		}

		await db.insert(notificationTable).values(notifications);
	});

	logger.info('Demo data seeded successfully');
};
