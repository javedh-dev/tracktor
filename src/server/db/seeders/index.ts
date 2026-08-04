import {
  fuelLogTable,
  complianceDocumentTable,
  maintenanceLogTable,
  vehicleTable,
  reminderTable,
  notificationTable,
  configTable
} from '$server/db/schema/index';
import { createOrUpdateUser } from '$server/services/authService';
import { db } from '$server/db/index';
import { faker } from '@faker-js/faker';
import { env } from '$lib/config/env.server';
import { logger } from '$server/config';
import { COMPLIANCE_TYPES, COMPLIANCE_RECURRENCE_TYPES } from '$lib/domain/compliance';
import {
  REMINDER_TYPES,
  REMINDER_SCHEDULES,
  REMINDER_RECURRENCE_TYPES
} from '$lib/domain/reminder';
import type { Vehicle } from '$lib/domain/vehicle';

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

function buildMileageSeries(
  startOdometer: number,
  count: number,
  minStep: number,
  maxStep: number
): number[] {
  let current = startOdometer;
  return Array.from({ length: count }, () => {
    const baseIncrement = faker.number.int({ min: minStep, max: maxStep });
    const deviation = faker.number.float({ min: -0.03, max: 0.03 });
    current += Math.max(Math.round(minStep * 0.2), Math.round(baseIncrement * (1 + deviation)));
    return current;
  });
}

/** Realistic make/model/year/type combos instead of faker's mismatched random pairings. */
const VEHICLE_CATALOG: Array<
  Pick<Vehicle, 'make' | 'model' | 'year' | 'fuelType' | 'vehicleType'> & { color: string }
> = [
  {
    make: 'Toyota',
    model: 'Camry',
    year: 2021,
    fuelType: 'petrol',
    vehicleType: 'car',
    color: '#1c3f60'
  },
  {
    make: 'Tesla',
    model: 'Model 3',
    year: 2023,
    fuelType: 'electric',
    vehicleType: 'car',
    color: '#f2f2f2'
  },
  {
    make: 'Volkswagen',
    model: 'Transporter',
    year: 2020,
    fuelType: 'diesel',
    vehicleType: 'van',
    color: '#4b4b4b'
  },
  {
    make: 'Royal Enfield',
    model: 'Classic 350',
    year: 2022,
    fuelType: 'petrol',
    vehicleType: 'motorcycle',
    color: '#1e1e1e'
  }
];

/** Rough yearly distance by vehicle type, used to derive a plausible current odometer from age. */
const ANNUAL_DISTANCE_BY_TYPE: Record<string, [number, number]> = {
  car: [10000, 18000],
  truck: [15000, 26000],
  van: [15000, 24000],
  motorcycle: [3000, 8000],
  scooter: [2500, 6000],
  farm_vehicle: [1500, 4500],
  bus: [20000, 35000],
  rv: [3000, 9000],
  yacht: [200, 800],
  other: [5000, 12000]
};

function estimateOdometer(vehicleType: string, year: number): number {
  const ageYears = Math.max(new Date().getFullYear() - year, 0.5);
  const [min, max] = ANNUAL_DISTANCE_BY_TYPE[vehicleType] ?? ANNUAL_DISTANCE_BY_TYPE.other;
  const annualDistance = faker.number.int({ min, max });
  return Math.max(Math.round(ageYears * annualDistance), 300);
}

/** Fill-up profile by vehicle so a scooter doesn't get 50L fuel logs like a truck. */
function getFuelProfile(vehicleType: string, fuelType: string) {
  if (fuelType === 'electric') {
    return { minAmt: 20, maxAmt: 75, minPrice: 0.12, maxPrice: 0.38, logCount: 22, daysBack: 540 };
  }
  switch (vehicleType) {
    case 'motorcycle':
    case 'scooter':
      return { minAmt: 4, maxAmt: 14, minPrice: 1.15, maxPrice: 1.85, logCount: 14, daysBack: 540 };
    case 'truck':
    case 'van':
    case 'bus':
    case 'farm_vehicle':
      return {
        minAmt: 55,
        maxAmt: 140,
        minPrice: 1.15,
        maxPrice: 1.85,
        logCount: 16,
        daysBack: 540
      };
    default:
      return {
        minAmt: 32,
        maxAmt: 58,
        minPrice: 1.15,
        maxPrice: 1.85,
        logCount: 18,
        daysBack: 540
      };
  }
}

const clearDb = async () => {
  await db.delete(notificationTable);
  await db.delete(reminderTable);
  await db.delete(complianceDocumentTable);
  await db.delete(maintenanceLogTable);
  await db.delete(fuelLogTable);
  await db.delete(vehicleTable);
};

/** Compliance dates that satisfy the app's own rule: 'none' recurrence needs a future end date. */
function randomComplianceDates() {
  const recurrenceType = faker.helpers.arrayElement(
    Object.keys(COMPLIANCE_RECURRENCE_TYPES) as Array<keyof typeof COMPLIANCE_RECURRENCE_TYPES>
  );
  return {
    recurrenceType,
    recurrenceInterval:
      recurrenceType === 'none' || recurrenceType === 'no_end'
        ? 1
        : faker.number.int({ min: 1, max: 3 }),
    startDate: faker.date.past({ years: 1 }).toISOString(),
    endDate: recurrenceType === 'none' ? faker.date.future({ years: 1 }).toISOString() : null
  };
}

const COMPLIANCE_ISSUERS: Record<string, () => string> = {
  insurance: () => `${faker.company.name()} Insurance`,
  emissions: () => `${faker.location.city()} Emissions Testing Center`,
  roadworthiness: () => `${faker.location.city()} Vehicle Inspection Authority`,
  registration: () => `${faker.location.state()} Department of Motor Vehicles`,
  other: () => faker.company.name()
};

const OTHER_COMPLIANCE_LABELS = [
  'Extended Warranty',
  'Roadside Assistance Plan',
  'Service Contract'
];

async function seedComplianceForVehicle(vehicle: { id: string }) {
  const optionalTypes = faker.helpers.arrayElements(
    ['emissions', 'roadworthiness', 'registration'] as const,
    faker.number.int({ min: 1, max: 2 })
  );
  const types: Array<keyof typeof COMPLIANCE_TYPES> = ['insurance', ...optionalTypes];
  if (faker.datatype.boolean({ probability: 0.2 })) types.push('other');

  const documents = types.map((type) => {
    const dates = randomComplianceDates();
    return {
      vehicleId: vehicle.id,
      type,
      otherLabel: type === 'other' ? faker.helpers.arrayElement(OTHER_COMPLIANCE_LABELS) : null,
      issuer: COMPLIANCE_ISSUERS[type](),
      documentNumber:
        type === 'insurance'
          ? faker.string.numeric({ length: { min: 12, max: 18 } })
          : faker.string.alphanumeric({ casing: 'upper', length: 10 }),
      ...dates,
      cost: type === 'insurance' ? faker.number.int({ min: 1000, max: 5000 }) : null
    };
  });

  await db.insert(complianceDocumentTable).values(documents);
}

const MAINTENANCE_SERVICES = [
  { label: 'Oil service', cost: [40, 240] },
  { label: 'Brake service', cost: [80, 420] },
  { label: 'Full inspection', cost: [50, 180] },
  { label: 'Timing belt', cost: [250, 1200] },
  { label: 'Tyre replacement', cost: [120, 700] },
  { label: 'Battery replacement', cost: [80, 300] },
  { label: 'AC service', cost: [60, 220] }
] as const;

async function seedMaintenanceForVehicle(vehicle: { id: string; odometer: number | null }) {
  const currentOdometer = vehicle.odometer ?? 10000;
  const serviceCount = faker.number.int({ min: 3, max: 6 });
  const serviceDates = buildDateSeries(serviceCount, 1200);

  const logs = serviceDates.map((date, index) => {
    const progress = (index + 1) / serviceCount;
    const odometer = Math.max(Math.round(currentOdometer * progress), 200);
    const service = faker.helpers.arrayElement(MAINTENANCE_SERVICES);

    return {
      vehicleId: vehicle.id,
      date: date.toISOString(),
      odometer,
      serviceCenter: `${faker.company.name()} Auto Service`,
      cost: faker.number.int({ min: service.cost[0], max: service.cost[1] }),
      notes: service.label
    };
  });

  await db.insert(maintenanceLogTable).values(logs);
}

async function seedFuelLogsForVehicle(vehicle: {
  id: string;
  odometer: number | null;
  vehicleType: string;
  fuelType: string;
}) {
  const profile = getFuelProfile(vehicle.vehicleType, vehicle.fuelType);
  const currentOdometer = vehicle.odometer ?? 10000;
  const dates = buildDateSeries(profile.logCount, profile.daysBack);
  const step = Math.max(Math.round(currentOdometer / (profile.logCount + 2)), 50);
  const mileage = buildMileageSeries(
    Math.max(currentOdometer - step * profile.logCount, 200),
    profile.logCount,
    Math.round(step * 0.7),
    Math.round(step * 1.3)
  );

  const logs = dates.map((date, index) => {
    const fuelAmount = faker.number.float({
      min: profile.minAmt,
      max: profile.maxAmt,
      fractionDigits: 2
    });
    const baseUnitPrice = faker.number.float({
      min: profile.minPrice,
      max: profile.maxPrice,
      fractionDigits: 2
    });
    const priceDeviation = faker.number.float({ min: -0.1, max: 0.1 });
    const unitPrice = Number((baseUnitPrice * (1 + priceDeviation)).toFixed(2));
    const cost = Number((fuelAmount * unitPrice).toFixed(2));

    return {
      vehicleId: vehicle.id,
      date: date.toISOString(),
      odometer: mileage[index],
      fuelAmount,
      rate: unitPrice,
      cost,
      filled: true,
      missedLast: index > 0 && faker.datatype.boolean({ probability: 0.08 })
    };
  });

  await db.insert(fuelLogTable).values(logs);
}

const REMINDER_NOTES: Record<string, string[]> = {
  maintenance: ['Book the service slot', 'Check for recall notices before the visit'],
  insurance: ['Compare renewal quotes before it lapses', 'Auto-renewal is off, do this manually'],
  pollution: ['Nearest testing center closes early on weekends'],
  registration: ['Renewal requires the smog certificate first'],
  inspection: ['Bring the last service invoice'],
  custom: ['Check tyre pressure and wiper fluid']
};

async function seedRemindersForVehicle(vehicle: { id: string }) {
  const reminderTypes = faker.helpers.arrayElements(
    Object.keys(REMINDER_TYPES) as Array<keyof typeof REMINDER_TYPES>,
    faker.number.int({ min: 2, max: 4 })
  );

  const reminders = reminderTypes.map((type) => {
    const daysOffset = faker.number.int({ min: -20, max: 60 });
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysOffset);
    const isCompleted = daysOffset < 0 && faker.datatype.boolean({ probability: 0.6 });

    return {
      vehicleId: vehicle.id,
      type,
      dueDate: dueDate.toISOString(),
      remindSchedule: faker.helpers.arrayElement(
        Object.keys(REMINDER_SCHEDULES) as Array<keyof typeof REMINDER_SCHEDULES>
      ),
      recurrenceType: faker.helpers.arrayElement(
        Object.keys(REMINDER_RECURRENCE_TYPES) as Array<keyof typeof REMINDER_RECURRENCE_TYPES>
      ) as keyof typeof REMINDER_RECURRENCE_TYPES,
      recurrenceInterval: 1,
      recurrenceEndDate: null,
      note: faker.helpers.arrayElement(REMINDER_NOTES[type] ?? REMINDER_NOTES.custom),
      isCompleted
    };
  });

  await db.insert(reminderTable).values(reminders);
}

async function seedNotificationsForVehicle(vehicle: { id: string }) {
  const notifications = [];
  const notificationTypes = ['reminder', 'alert', 'maintenance', 'compliance'];
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
      case 'compliance':
        message = faker.helpers.arrayElement([
          `Insurance renewal due for policy ${faker.string.alphanumeric({ length: 8, casing: 'upper' })}`,
          'Emissions certificate expiring soon - visit testing center',
          'Roadworthiness inspection due soon',
          'Registration renewal due soon'
        ]);
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
}

const seedDemoData = async (enforce: boolean = false) => {
  if (!env.DISABLE_AUTH) await seedDefaultUser();
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
    .values(
      VEHICLE_CATALOG.map((profile) => ({
        make: profile.make,
        model: profile.model,
        year: profile.year,
        fuelType: profile.fuelType,
        vehicleType: profile.vehicleType,
        licensePlate: faker.vehicle.vrm(),
        vin: faker.vehicle.vin(),
        color: profile.color,
        odometer: estimateOdometer(profile.vehicleType, profile.year)
      }))
    )
    .returning();

  await Promise.all(vehicles.map((vehicle) => seedComplianceForVehicle(vehicle)));
  await Promise.all(vehicles.map((vehicle) => seedMaintenanceForVehicle(vehicle)));
  await Promise.all(vehicles.map((vehicle) => seedFuelLogsForVehicle(vehicle)));
  await Promise.all(vehicles.map((vehicle) => seedRemindersForVehicle(vehicle)));
  await Promise.all(vehicles.map((vehicle) => seedNotificationsForVehicle(vehicle)));

  logger.info(`Demo data seeded successfully (${vehicles.length} vehicles)`);
};
