import {
	fuelLogTable,
	insuranceTable,
	maintenanceLogTable,
	pollutionCertificateTable,
	vehicleTable
} from '$server/db/schema/index';
import { createOrUpdateUser } from '$server/services/authService';
import { db } from '$server/db/index';
import { faker } from '@faker-js/faker';
import { env } from '$lib/config/env';
import { logger } from '$server/config';

export const seedData = async () => {
	logger.debug('Seeding data ', {
		FORCE_DATA_SEED: env.FORCE_DATA_SEED,
		DEMO_MODE: env.DEMO_MODE
	});

	if (env.DEMO_MODE && env.NODE_ENV !== 'test') await seedDemoData(env.FORCE_DATA_SEED);
};

const seedDefaultUser = async () => {
	await createOrUpdateUser('demo', 'demo');
	logger.info('Default demo user created!!!');
};

export const clearDb = async () => {
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
		await db
			.insert(insuranceTable)
			.values({
				vehicleId: vehicle.id,
				provider: faker.company.name(),
				policyNumber: faker.string.numeric({ length: { min: 12, max: 18 } }),
				startDate: faker.date.past({ years: 1 }).toDateString(),
				endDate: faker.date.future({ years: 1 }).toDateString(),
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
		await db
			.insert(pollutionCertificateTable)
			.values({
				vehicleId: vehicle.id,
				certificateNumber: faker.string.alphanumeric({
					casing: 'upper',
					length: 10
				}),
				issueDate: faker.date.past({ years: 1 }).toDateString(),
				expiryDate: faker.date.future({ years: 1 }).toDateString(),
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

	logger.info('Demo data seeded successfully');
};
