import bcrypt from "bcrypt";
import {
  authTable,
  fuelLogTable,
  insuranceTable,
  maintenanceLogTable,
  pollutionCertificateTable,
  vehicleTable,
} from "@db/schema/index";
import { db } from "@db/index";
import { faker } from "@faker-js/faker";
import { env, logger } from "@config/index";

export const seedData = async () => {
  logger.info("Seeding data ", {
    FORCE_DATA_SEED: process.env.FORCE_DATA_SEED,
    PUBLIC_DEMO_MODE: process.env.PUBLIC_DEMO_MODE,
  });

  if (!env.DEMO_MODE && env.AUTH_PIN.trim().length == 6) {
    await seedAuthPin(env.AUTH_PIN.trim());
  } else {
    logger.warn(
      "Skipping auth PIN setup. Either DEMO_MODE is enabled or AUTH_PIN is invalid.",
    );
  }

  if (env.DEMO_MODE && env.NODE_ENV !== "test")
    await seedDemoData(env.FORCE_DATA_SEED);
};

const seedAuthPin = async (pin: string) => {
  const hash = await bcrypt.hash(pin, 10);
  await db
    .insert(authTable)
    .values({ id: 1, hash })
    .onConflictDoUpdate({ set: { hash: hash }, target: authTable.id })
    .run();
  logger.info("Authentication PIN configured");
};

export const clearDb = async () => {
  await db.delete(pollutionCertificateTable);
  await db.delete(maintenanceLogTable);
  await db.delete(fuelLogTable);
  await db.delete(insuranceTable);
  await db.delete(vehicleTable);
};

const seedDemoData = async (enforce: boolean = false) => {
  seedAuthPin("123456");
  if (!enforce) {
    const existingVehicles = await db.$count(vehicleTable);
    if (existingVehicles > 0) {
      logger.info("Demo data already exists, skipping");
      return;
    }
  } else {
    logger.warn("Forcing demo data seed. Deleting existing data...");
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
        odometer: faker.number.int({ min: 100, max: 500000 }),
      },
      {
        make: faker.vehicle.manufacturer(),
        model: faker.vehicle.model(),
        year: faker.number.int({ min: 2000, max: 2025 }),
        licensePlate: faker.vehicle.vrm(),
        vin: faker.vehicle.vin(),
        color: faker.color.rgb(),
        odometer: faker.number.int({ min: 100, max: 500000 }),
      },
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
        cost: faker.number.int({ min: 1000, max: 5000 }),
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
        cost: faker.number.int({ min: 1000, max: 5000 }),
      })
      .run();
  });

  vehicles.forEach(async (vehicle) => {
    await db
      .insert(pollutionCertificateTable)
      .values({
        vehicleId: vehicle.id,
        certificateNumber: faker.string.alphanumeric({
          casing: "upper",
          length: 10,
        }),
        issueDate: faker.date.past({ years: 1 }).toDateString(),
        expiryDate: faker.date.future({ years: 1 }).toDateString(),
        testingCenter: faker.company.name(),
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
          max: vehicle.odometer! + 5000,
        }),
        fuelAmount: faker.number.float({ min: 10, max: 25 }),
        cost: faker.number.float({ min: 10, max: 10000 }),
        filled: faker.datatype.boolean({ probability: 0.9 }),
        missedLast: faker.datatype.boolean({ probability: 0.1 }),
      });
    }
    await db.insert(fuelLogTable).values(fuelLogs);
  });

  logger.info("Demo data seeded successfully");
};
