import { FuelLogError } from "@exceptions/FuelLogError.js";
import { Status } from "@exceptions/ServiceError.js";
import { VehicleError } from "@exceptions/VehicleError.js";
import { Vehicle, FuelLog } from "@models/index.js";

export const addFuelLog = async (vehicleId: string, fuelLogData: any) => {
  const vehicle = await Vehicle.findByPk(vehicleId);
  if (!vehicle) {
    throw new VehicleError(
      `No vehicle found for id : ${vehicleId}`,
      Status.NOT_FOUND,
    );
  }
  const fuelLog = await FuelLog.create({
    ...fuelLogData,
    vehicleId: vehicleId,
  });
  return { id: fuelLog.id, message: "Fuel log added successfully." };
};

export const getFuelLogs = async (vehicleId: string) => {
  const fuelLogs = await FuelLog.findAll({
    where: { vehicleId: vehicleId },
    order: [
      ["date", "ASC"],
      ["odometer", "ASC"],
    ],
  });

  // Calculate mileage
  return fuelLogs.map((log, index, arr) => {
    // mileage can only be calculated for a full tank and a previous log is needed
    if (index === 0 || !log.filled || log.missedLast) {
      return { ...log.toJSON(), mileage: null };
    }

    // find the previous full tank log that serves as a starting point
    // a missed log acts as a barrier, preventing searching further back
    let startIndex = -1;
    for (let i = index - 1; i >= 0; i--) {
      if (arr[i]?.filled) {
        startIndex = i;
        break;
      }
      if (arr[i]?.missedLast) {
        break;
      }
    }

    // if there is no valid starting log, mileage can't be calculated
    if (startIndex === -1) {
      return { ...log.toJSON(), mileage: null };
    }

    const startLog = arr[startIndex]!;
    const distance = log.odometer - startLog.odometer;

    // sum all fuel added after the starting log (accounts for partial fills)
    let totalFuel = 0;
    for (let i = startIndex + 1; i <= index; i++) {
      totalFuel += arr[i]!.fuelAmount;
    }

    // avoid division by zero and ensure distance is positive
    if (totalFuel === 0 || distance <= 0) {
      return { ...log.toJSON(), mileage: null };
    }

    const mileage = distance / totalFuel;
    return { ...log.toJSON(), mileage: parseFloat(mileage.toFixed(2)) };
  });
};

export const getFuelLogById = async (id: string) => {
  const fuelLog = await FuelLog.findByPk(id);
  if (!fuelLog) {
    throw new FuelLogError(
      `No Fuel Logs found for id : ${id}`,
      Status.NOT_FOUND,
    );
  }
  return fuelLog;
};

export const updateFuelLog = async (id: string, fuelLogData: any) => {
  const fuelLog = await FuelLog.findByPk(id);
  if (!fuelLog) {
    throw new FuelLogError(
      `No Fuel Logs found for id : ${id}`,
      Status.NOT_FOUND,
    );
  }

  await fuelLog.update(fuelLogData);
  return { message: "Fuel log updated successfully." };
};

export const deleteFuelLog = async (id: string) => {
  const result = await FuelLog.destroy({
    where: { id: id },
  });
  if (result === 0) {
    throw new FuelLogError(
      `No Fuel Logs found for id : ${id}`,
      Status.NOT_FOUND,
    );
  }
  return { message: "Fuel log deleted successfully." };
};
