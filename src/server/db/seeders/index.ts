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
    {
      key: 'notificationProcessingEnabled',
      value: 'true',
      description: 'Enable scheduled processing of notification providers'
    },
    {
      key: 'notificationProcessingSchedule',
      value: '0 9 * * *',
      description: 'Cron schedule for processing queued provider notifications'
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

function buildDateSeries(count: number, daysBack: number): Date[] {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - daysBack);

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start);
    const step = Math.floor(daysBack / Math.max(count - 1, 1));
    date.setDate(start.getDate() + index * step);
    return date;
  });
}

function buildMileageSeries(startOdometer: number, count: number): number[] {
  let current = startOdometer;
  return Array.from({ length: count }, () => {
    const baseIncrement = faker.number.int({ min: 650, max: 1800 });
    const deviation = faker.number.float({ min: -0.03, max: 0.03 });
    current += Math.max(120, Math.round(baseIncrement * (1 + deviation)));
    return current;
  });
}

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

  await Promise.all(
    vehicles.map(async (vehicle) => {
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
    })
  );

  await Promise.all(
    vehicles.map(async (vehicle) => {
      const count = 18;
      const dates = buildDateSeries(count, 540);
      const mileage = buildMileageSeries(Math.max(vehicle.odometer! - 18000, 1000), count);
      const fuelLogs = dates.map((date, index) => {
        const fuelAmount = faker.number.float({ min: 32, max: 58, fractionDigits: 2 });
        const baseUnitPrice = faker.number.float({ min: 1.15, max: 1.85, fractionDigits: 2 });
        const priceDeviation = faker.number.float({ min: -0.1, max: 0.1 });
        const unitPrice = Number((baseUnitPrice * (1 + priceDeviation)).toFixed(2));
        const cost = Number((fuelAmount * unitPrice).toFixed(2));

        return {
          vehicleId: vehicle.id,
          date: date.toISOString(),
          odometer: mileage[index],
          fuelAmount,
          cost,
          filled: true,
          missedLast: index > 0 && faker.datatype.boolean({ probability: 0.08 })
        };
      });

      await db.insert(fuelLogTable).values(fuelLogs);
    })
  );

  await Promise.all(
    vehicles.map(async (vehicle) => {
      const serviceDates = buildDateSeries(faker.number.int({ min: 2, max: 4 }), 1200);
      const maintenanceLogs = serviceDates.map((date, index) => {
        const baseOdometer = Math.max(vehicle.odometer! - 14000, 5000);
        const odometer = baseOdometer + index * faker.number.int({ min: 5500, max: 12000 });
        const serviceTypes = [
          { label: 'Oil service', cost: [120, 240] },
          { label: 'Brake service', cost: [180, 420] },
          { label: 'Full inspection', cost: [90, 180] },
          { label: 'Timing belt', cost: [450, 1200] },
          { label: 'Tyre replacement', cost: [260, 700] }
        ] as const;
        const service = faker.helpers.arrayElement(serviceTypes);

        return {
          vehicleId: vehicle.id,
          date: date.toISOString(),
          odometer,
          serviceCenter: faker.company.name(),
          cost: faker.number.int({ min: service.cost[0], max: service.cost[1] })
        };
      });

      await db.insert(maintenanceLogTable).values(maintenanceLogs);
    })
  );

  // Seed notifications for demo mode
  await Promise.all(
    vehicles.map(async (vehicle) => {
      const notifications = [];
      const notificationTypes = ['reminder', 'alert', 'maintenance', 'insurance', 'pollution'];
      const channels = ['reminder', 'alert', 'information'];
      const sources = ['system', 'user'];

      const notificationCount = faker.number.int({ min: 5, max: 8 });

      for (let i = 0; i < notificationCount; i++) {
        const type = faker.helpers.arrayElement(notificationTypes);
        const daysOffset = faker.number.int({ min: -15, max: 30 });
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
          channel: faker.helpers.arrayElement(channels),
          message,
          source: faker.helpers.arrayElement(sources),
          dueDate: dueDate.toISOString(),
          isRead: faker.datatype.boolean({ probability: 0.3 }),
          notificationKey: faker.string.uuid(),
          clearedAt: null
        });
      }

      await db.insert(notificationTable).values(notifications);
    })
  );

  logger.info('Demo data seeded successfully');
};
