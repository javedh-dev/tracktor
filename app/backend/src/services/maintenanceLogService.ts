import { MaintenanceLog, Vehicle } from "@models/index.js";
import { MaintenanceLogError } from "@exceptions/MaintenanceLogError.js";
import { Status } from "@exceptions/ServiceError.js";

export const addMaintenanceLog = async (
  vehicleId: string,
  maintenanceLogData: any,
) => {
  const vehicle = await Vehicle.findByPk(vehicleId);
  if (!vehicle) {
    throw new MaintenanceLogError(
      `No vehicle found for id ${vehicleId}`,
      Status.NOT_FOUND,
    );
  }

  const maintenanceLog = await MaintenanceLog.create({
    ...maintenanceLogData,
    vehicleId: vehicleId,
  });
  return {
    id: maintenanceLog.id,
    message: "Maintenance log added successfully.",
  };
};

export const getMaintenanceLogs = async (vehicleId: string) => {
  const maintenanceLogs = await MaintenanceLog.findAll({
    where: { vehicleId: vehicleId },
    order: [
      ["date", "ASC"],
      ["odometer", "ASC"],
    ],
  });
  return maintenanceLogs;
};

export const getMaintenanceLogById = async (id: string) => {
  const maintenanceLog = await MaintenanceLog.findByPk(id);
  if (!maintenanceLog) {
    throw new MaintenanceLogError(
      `No Maintenence log found for id : ${id}`,
      Status.NOT_FOUND,
    );
  }
  return maintenanceLog;
};

export const updateMaintenanceLog = async (
  id: string,
  maintenanceLogData: any,
) => {
  const maintenanceLog = await MaintenanceLog.findByPk(id);
  if (!maintenanceLog) {
    throw new MaintenanceLogError(
      `No Maintenence log found for id : ${id}`,
      Status.NOT_FOUND,
    );
  }

  await maintenanceLog.update(maintenanceLogData);
  return { message: "Maintenance log updated successfully." };
};

export const deleteMaintenanceLog = async (id: string) => {
  const result = await MaintenanceLog.destroy({
    where: { id: id },
  });
  if (result === 0) {
    throw new MaintenanceLogError(
      `No Maintenence log found for id : ${id}`,
      Status.NOT_FOUND,
    );
  }
  return { message: "Maintenance log deleted successfully." };
};
