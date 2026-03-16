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
      key: 'notificationProcessingSchedule',
      value: '0 9 * * *',
      description: 'Cron schedule for processing queued provider notifications'
    },
    {
      key: 'notificationEmailSubjectTemplate',
      value: 'Tracktor: {{total_count}} pending notification{{plural_suffix}}',
      description: 'Subject template for notification emails'
    },
    {
      key: 'notificationEmailTextTemplate',
      value:
        'Tracktor Notification Summary\n=====================================\n\n{{summary_sentence}}\n\n{{notification_groups_text}}\nReview details in Tracktor to manage your notifications.',
      description: 'Plain text template for notification emails'
    },
    {
      key: 'notificationEmailHtmlTemplate',
      value:
        '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>{{email_title}}</title>\n</head>\n<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif;color:#101828;">\n<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f4;">\n<tr><td align="center" style="padding:40px 20px;">\n<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid #e4e7ec;border-radius:20px;overflow:hidden;">\n<tr><td style="padding:36px 32px 18px 32px;">\n<div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#667085;font-weight:600;margin-bottom:14px;">Tracktor</div>\n<h1 style="margin:0;font-size:28px;line-height:1.2;color:#101828;font-weight:700;">Notification Summary</h1>\n<p style="margin:12px 0 0 0;font-size:15px;line-height:1.7;color:#475467;">{{summary_sentence}}</p>\n</td></tr>\n<tr><td style="padding:0 32px 32px 32px;">\n<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fafaf9;border:1px solid #eaecf0;border-radius:16px;margin-top:18px;">\n<tr><td style="padding:20px 22px;text-align:center;">\n<div style="font-size:34px;line-height:1;font-weight:700;color:#101828;margin-bottom:6px;">{{total_count}}</div>\n<p style="font-size:14px;line-height:1.5;color:#475467;margin:0;font-weight:500;">Pending Notification{{plural_suffix}}</p>\n</td></tr>\n</table>\n{{notification_groups_html}}\n<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:36px;border-top:1px solid #eaecf0;">\n<tr><td style="padding-top:20px;text-align:left;">\n<p style="margin:0;font-size:13px;line-height:1.7;color:#667085;">Open Tracktor to review details, mark items as read, and manage your vehicles.</p>\n</td></tr>\n</table>\n</td></tr>\n</table>\n<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin-top:24px;">\n<tr><td style="text-align:center;padding:0 20px;">\n<p style="font-size:12px;line-height:1.6;color:#98a2b3;margin:0 0 4px 0;">This is an automated message from Tracktor</p>\n<p style="font-size:11px;line-height:1.6;color:#98a2b3;margin:0;">Please do not reply to this email</p>\n</td></tr>\n</table>\n</td></tr>\n</table>\n</body>\n</html>',
      description: 'HTML template for notification emails'
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
    const channels = ['reminder', 'alert', 'information'];
    const sources = ['system', 'user'];

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
  });

  logger.info('Demo data seeded successfully');
};
