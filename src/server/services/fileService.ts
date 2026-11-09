import { and, eq } from 'drizzle-orm';
import { db } from '$server/db';
import * as schema from '$server/db/schema';
import { AppError, Status } from '$server/exceptions/AppError';
import { assertSafeUploadFilename } from '$server/utils/file-route';
import { requireAccess, vehicleScope, type AccessContext } from './access';

const references = [
  {
    table: schema.vehicleTable,
    filename: schema.vehicleTable.image,
    vehicleId: schema.vehicleTable.id
  },
  {
    table: schema.fuelLogTable,
    filename: schema.fuelLogTable.attachment,
    vehicleId: schema.fuelLogTable.vehicleId
  },
  {
    table: schema.maintenanceLogTable,
    filename: schema.maintenanceLogTable.attachment,
    vehicleId: schema.maintenanceLogTable.vehicleId
  },
  {
    table: schema.complianceDocumentTable,
    filename: schema.complianceDocumentTable.attachment,
    vehicleId: schema.complianceDocumentTable.vehicleId
  }
];

/** Referenced files follow vehicle access; only an unbound upload follows its uploader. */
export async function requireReadableFile(access: AccessContext, filename: string): Promise<void> {
  requireAccess(access);
  assertSafeUploadFilename(filename);
  if (access.role === 'admin') return;
  let referenced = false;
  for (const reference of references) {
    const allowed = await db
      .select({ id: reference.vehicleId })
      .from(reference.table)
      .where(and(eq(reference.filename, filename), vehicleScope(reference.vehicleId, access)))
      .limit(1);
    if (allowed.length) return;
    const existing = await db
      .select({ id: reference.vehicleId })
      .from(reference.table)
      .where(eq(reference.filename, filename))
      .limit(1);
    referenced ||= existing.length > 0;
  }
  if (!referenced) {
    const upload = await db.query.uploadsTable.findFirst({
      where: and(
        eq(schema.uploadsTable.filename, filename),
        eq(schema.uploadsTable.userId, access.id)
      )
    });
    if (upload) return;
  }
  throw new AppError('File not found', Status.NOT_FOUND);
}

export async function requireAttachableFile(
  access: AccessContext,
  filename: unknown
): Promise<void> {
  if (filename === undefined || filename === null || filename === '') return;
  if (typeof filename !== 'string') throw new AppError('Invalid attachment', Status.BAD_REQUEST);
  await requireReadableFile(access, filename);
}

/** Never return provider secrets or unclassified configuration to drivers. */
export const DRIVER_CONFIG_KEYS = [
  'dateFormat',
  'locale',
  'timezone',
  'currency',
  'unitOfDistance',
  'unitOfVolume',
  'unitOfLpg',
  'unitOfCng',
  'mileageUnitFormat',
  'theme',
  'darkVariant',
  'customCss',
  'featureFuelLog',
  'featureMaintenance',
  'featureCompliance',
  'featureReminders',
  'featureOverview'
];
