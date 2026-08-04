---
type: 'Reference'
title: 'Domain and Data Models'
openwiki_generated: true
---

# Domain and Data Models

Tracktor's business entities are defined as TypeScript interfaces and Zod schemas in `src/lib/domain/`. The server uses matching Drizzle ORM tables in `src/server/db/schema/`.

## Vehicle

A vehicle is the top-level aggregate. Every other record belongs to a vehicle.

- Domain: `src/lib/domain/vehicle.ts`
- Schema: `src/server/db/schema/vehicle.ts`
- Server service: `src/server/services/vehicleService.ts`

Fields: `id`, `make`, `model`, `year`, `licensePlate`, `vin`, `color`, `odometer`, `image`, `fuelType`, `customFields`.

Fuel types: `petrol`, `diesel`, `electric`, `lpg`, `cng`.

Computed status fields (`insuranceStatus`, `puccStatus`) are derived from related records and added by the service layer; they are not stored on the vehicle table.

### Odometer and mileage

The service layer computes the "latest" odometer as the maximum of:

1. the vehicle's base `odometer`,
2. the highest odometer in fuel logs,
3. the highest odometer in maintenance logs.

Overall mileage is computed from fuel logs using full-tank fills as anchors; partial fills between two full fills are summed into total fuel. See `calculateOverallMileage` in `src/server/services/vehicleService.ts`.

## Fuel log

- Domain: `src/lib/domain/fuel.ts`
- Schema: `src/server/db/schema/fuel-log.ts`
- Server service: `src/server/services/fuelLogService.ts`
- Client service: `src/lib/services/fuel.service.ts`

Fields: `id`, `vehicleId`, `date`, `odometer`, `filled`, `missedLast`, `fuelAmount`, `rate`, `cost`, `notes`, `attachment`.

Recent additions:

- `rate` (added in `debf6e5`) supports per-liter/per-kg price and auto-calculation.
- `distanceDriven` is computed when listing logs by comparing the current odometer with the previous log.
- `mileage` is computed only for full-tank fills that have a valid preceding full-tank anchor; missed fills act as barriers.

## Maintenance log

- Domain: `src/lib/domain/maintenance.ts`
- Schema: `src/server/db/schema/maintenance-logs.ts`
- Server service: `src/server/services/maintenanceLogService.ts`
- Client service: `src/lib/services/maintenance.service.ts`
- PDF export: `src/server/services/maintenanceLogPdfService.ts` + `src/routes/api/garage/[id]/maintenance-logs/export-pdf/+server.ts`

Fields: `id`, `vehicleId`, `date`, `odometer`, `serviceCenter`, `cost`, `notes`, `attachment`.

PDF export generates a tabular report with date, odometer, service center, cost, and notes.

## Insurance

- Domain: `src/lib/domain/insurance.ts`
- Schema: `src/server/db/schema/insurance.ts`
- Server service: `src/server/services/insuranceService.ts`

Fields: `id`, `vehicleId`, `provider`, `policyNumber`, `startDate`, `endDate`, `recurrenceType`, `recurrenceInterval`, `cost`, `notes`, `attachment`.

Recurrence types: `none`, `yearly`, `monthly`, `no_end`. Recurring policies drive reminder generation.

## PUCC (Pollution Under Control Certificate)

- Domain: `src/lib/domain/pucc.ts`
- Schema: `src/server/db/schema/pucc.ts`
- Server service: `src/server/services/puccService.ts`

Fields: `id`, `vehicleId`, `certificateNumber`, `issueDate`, `expiryDate`, `cost`, `notes`, `attachment`.

## Reminder

- Domain: `src/lib/domain/reminder.ts`
- Schema: `src/server/db/schema/reminder.ts`
- Server service: `src/server/services/reminderService.ts`
- Client service: `src/lib/services/reminder.service.ts`

Reminders are tied to a vehicle and trigger notifications. They can be one-off or recurring and carry `dueDate`, `dueOdometer`, `type`, `status`, and `recurringInterval` fields.

## Notification

- Domain: `src/lib/domain/notification.ts`
- Schema: `src/server/db/schema/notification.ts`
- Server service: `src/server/services/notificationService.ts`

Notifications are the concrete messages produced from reminders and sent through configured notification providers.

## Notification provider

- Domain: `src/lib/domain/notification-provider.ts`
- Schema: `src/server/db/schema/notification-provider.ts`
- Server service: `src/server/services/notificationProviderService.ts`
- Dispatch: `src/server/services/notificationDispatchService.ts`

Providers are configurable backends (e.g., email, webhook) with type-specific fields. The scheduler dispatches pending notifications through enabled providers.

## Config

- Domain: `src/lib/domain/config.ts`
- Schema: `src/server/db/schema/config.ts`
- Server service: `src/server/services/configService.ts`
- Client store: `src/lib/stores/config.svelte.ts`

Configs are key/value pairs. Boolean configs are stored as `'true'`/`'false'` strings; the client store coerces them.

Important keys:

- `featureFuelLog`, `featureMaintenance`, `featurePucc`, `featureReminders`, `featureInsurance`, `featureOverview`
- `notificationProcessingEnabled`, `notificationProcessingSchedule`
- `dateFormat`, `currency`, `unitOfDistance`, `unitOfVolume`, `unitOfLpg`, `unitOfCng`, `mileageUnitFormat`
- `locale`, `timezone`
- `customCss`

## Auth

- Schema: `src/server/db/schema/auth.ts`
- Server service: `src/server/services/authService.ts`
- Session utils: `src/server/utils/session.ts`

Tables:

- `users` — `id`, `username`, `passwordHash`, timestamps.
- `sessions` — `id`, `userId`, `expiresAt`, timestamps.
- `auth` — legacy table kept for migration compatibility.

Sessions are 30-day HTTP-only secure cookies. Bcrypt is used with salt rounds `10`.

## Audit timestamps

Most tables include `createdAt`/`updatedAt` via the shared `timestamps` helper in `src/server/db/schema/audit.ts`.

## Source references

- Domain definitions: `src/lib/domain/*.ts`
- Drizzle schemas: `src/server/db/schema/*.ts`
- DB connection: `src/server/db/index.ts`
- DB initialization: `src/server/db/init.ts`
- Server services: `src/server/services/*.ts`
