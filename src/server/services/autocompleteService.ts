import { type AccessContext, vehicleScope } from './access';
import { db } from '../db/index';
import { and, sql } from 'drizzle-orm';
import * as schema from '../db/schema/index';

/**
 * Get unique values for service centers from maintenance logs
 */
export const getUniqueServiceCenters = async (access: AccessContext) => {
  const result = await db
    .selectDistinct({ serviceCenter: schema.maintenanceLogTable.serviceCenter })
    .from(schema.maintenanceLogTable)
    .where(
      and(
        vehicleScope(schema.maintenanceLogTable.vehicleId, access),
        sql`${schema.maintenanceLogTable.serviceCenter} IS NOT NULL AND ${schema.maintenanceLogTable.serviceCenter} != ''`
      )
    )
    .orderBy(schema.maintenanceLogTable.serviceCenter);

  const values = result.map((r) => r.serviceCenter).filter(Boolean);

  return values;
};

/**
 * Get unique values for compliance document issuers (insurance providers, testing centers,
 * inspection centers, registration authorities, ...), optionally narrowed to one type.
 */
export const getUniqueComplianceIssuers = async (access: AccessContext, type?: string) => {
  const result = await db
    .selectDistinct({ issuer: schema.complianceDocumentTable.issuer })
    .from(schema.complianceDocumentTable)
    .where(
      and(
        vehicleScope(schema.complianceDocumentTable.vehicleId, access),
        type
          ? sql`${schema.complianceDocumentTable.issuer} != '' AND ${schema.complianceDocumentTable.type} = ${type}`
          : sql`${schema.complianceDocumentTable.issuer} != ''`
      )
    )
    .orderBy(schema.complianceDocumentTable.issuer);

  const values = result.map((r) => r.issuer).filter(Boolean);

  return values;
};

/**
 * Get unique vehicle makes
 */
export const getUniqueVehicleMakes = async (access: AccessContext) => {
  const result = await db
    .selectDistinct({ make: schema.vehicleTable.make })
    .from(schema.vehicleTable)
    .where(
      and(
        vehicleScope(schema.vehicleTable.id, access),
        sql`${schema.vehicleTable.make} IS NOT NULL AND ${schema.vehicleTable.make} != ''`
      )
    )
    .orderBy(schema.vehicleTable.make);

  const values = result.map((r) => r.make).filter(Boolean);

  return values;
};

/**
 * Get unique vehicle models (optionally filtered by make)
 */
export const getUniqueVehicleModels = async (access: AccessContext) => {
  const result = await db
    .selectDistinct({ model: schema.vehicleTable.model })
    .from(schema.vehicleTable)
    .where(
      and(
        vehicleScope(schema.vehicleTable.id, access),
        sql`${schema.vehicleTable.model} IS NOT NULL AND ${schema.vehicleTable.model} != ''`
      )
    )
    .orderBy(schema.vehicleTable.model);

  const values = result.map((r) => r.model).filter(Boolean);

  return values;
};
