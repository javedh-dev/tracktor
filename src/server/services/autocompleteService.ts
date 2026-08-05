import { db } from '../db/index';
import { sql } from 'drizzle-orm';
import * as schema from '../db/schema/index';

/**
 * Get unique values for service centers from maintenance logs
 */
export const getUniqueServiceCenters = async () => {
  const result = await db
    .selectDistinct({ serviceCenter: schema.maintenanceLogTable.serviceCenter })
    .from(schema.maintenanceLogTable)
    .where(
      sql`${schema.maintenanceLogTable.serviceCenter} IS NOT NULL AND ${schema.maintenanceLogTable.serviceCenter} != ''`
    )
    .orderBy(schema.maintenanceLogTable.serviceCenter);

  const values = result.map((r) => r.serviceCenter).filter(Boolean);

  return values;
};

/**
 * Get unique values for compliance document issuers (insurance providers, testing centers,
 * inspection centers, registration authorities, ...), optionally narrowed to one type.
 */
export const getUniqueComplianceIssuers = async (type?: string) => {
  const result = await db
    .selectDistinct({ issuer: schema.complianceDocumentTable.issuer })
    .from(schema.complianceDocumentTable)
    .where(
      type
        ? sql`${schema.complianceDocumentTable.issuer} != '' AND ${schema.complianceDocumentTable.type} = ${type}`
        : sql`${schema.complianceDocumentTable.issuer} != ''`
    )
    .orderBy(schema.complianceDocumentTable.issuer);

  const values = result.map((r) => r.issuer).filter(Boolean);

  return values;
};

/**
 * Get unique vehicle makes
 */
export const getUniqueVehicleMakes = async () => {
  const result = await db
    .selectDistinct({ make: schema.vehicleTable.make })
    .from(schema.vehicleTable)
    .where(sql`${schema.vehicleTable.make} IS NOT NULL AND ${schema.vehicleTable.make} != ''`)
    .orderBy(schema.vehicleTable.make);

  const values = result.map((r) => r.make).filter(Boolean);

  return values;
};

/**
 * Get unique vehicle models (optionally filtered by make)
 */
export const getUniqueVehicleModels = async () => {
  const result = await db
    .selectDistinct({ model: schema.vehicleTable.model })
    .from(schema.vehicleTable)
    .where(sql`${schema.vehicleTable.model} IS NOT NULL AND ${schema.vehicleTable.model} != ''`)
    .orderBy(schema.vehicleTable.model);

  const values = result.map((r) => r.model).filter(Boolean);

  return values;
};
