import { AppError, Status } from '../exceptions/AppError';
import { db } from '../db/index';
import { eq } from 'drizzle-orm';

/**
 * Validates that a vehicle exists by ID
 * @param vehicleId - The vehicle ID to validate
 * @throws AppError if vehicle is not found
 */
export const validateVehicleExists = async (vehicleId: string): Promise<void> => {
  const vehicle = await db.query.vehicleTable.findFirst({
    where: (vehicles, { eq }) => eq(vehicles.id, vehicleId)
  });

  if (!vehicle) {
    throw new AppError(`No vehicle found for id : ${vehicleId}`, Status.NOT_FOUND);
  }
};

/**
 * Generic delete operation with standard error handling
 * @param table - The database table to delete from
 * @param id - The ID of the record to delete
 * @param entityName - The name of the entity for error messages
 * @returns ApiResponse with delete result
 */
export const performDelete = async (
  table: any,
  id: string,
  entityName: string
): Promise<{ id: string }> => {
  const result = await db.delete(table).where(eq(table.id, id)).execute();

  if (result.rowsAffected === 0) {
    throw new AppError(`No ${entityName} found for id : ${id}`, Status.NOT_FOUND);
  }

  return { id };
};
