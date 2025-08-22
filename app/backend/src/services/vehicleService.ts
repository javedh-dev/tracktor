import { Status, statusFromError } from "@exceptions/ServiceError.js";
import { VehicleError } from "@exceptions/VehicleError.js";
import { Insurance, PollutionCertificate, Vehicle } from "@models/index.js";

export const addVehicle = async (vehicleData: any) => {
  const vehicle = await Vehicle.create(vehicleData);
  return { id: vehicle.id, message: "Vehicle added successfully." };
};

export const getAllVehicles = async () => {
  const vehicles = await Vehicle.findAll({
    include: [
      { association: "insurance" },
      { association: "pollutionCertificate" },
    ],
  });

  return vehicles.map((vehicle) => {
    const insurances: Insurance[] = (vehicle as any).insurance;
    const pollutionCertificates: PollutionCertificate[] = (vehicle as any)
      .pollutionCertificate;

    let insuranceStatus = "Not Available";
    if (insurances && insurances.length > 0) {
      insuranceStatus = "Expired";
      insurances.forEach((insurance) => {
        const endDate = new Date(insurance.endDate);
        const today = new Date();
        if (endDate > today) {
          insuranceStatus = "Active";
        }
      });
    }

    let puccStatus = "Not Available";
    if (pollutionCertificates && pollutionCertificates.length > 0) {
      puccStatus = "Expired";
      pollutionCertificates.forEach((pucc) => {
        const expiryDate = new Date(pucc.expiryDate);
        const today = new Date();
        if (expiryDate > today) {
          puccStatus = "Active";
        }
      });
    }

    return {
      ...vehicle.toJSON(),
      insuranceStatus,
      puccStatus,
    };
  });
};

export const getVehicleById = async (id: string) => {
  const vehicle = await Vehicle.findByPk(id);
  if (!vehicle) {
    throw new VehicleError(`No vehicle found for id : ${id}`, Status.NOT_FOUND);
  }
  return vehicle;
};

export const updateVehicle = async (id: string, vehicleData: any) => {
  const vehicle = await Vehicle.findByPk(id);
  if (!vehicle) {
    throw new VehicleError(`No vehicle found for id : ${id}`, Status.NOT_FOUND);
  }

  await vehicle.update(vehicleData);
  return { message: "Vehicle updated successfully." };
};

export const deleteVehicle = async (id: string) => {
  const result = await Vehicle.destroy({
    where: { id: id },
    cascade: true,
  });
  if (result === 0) {
    throw new VehicleError(`No vehicle found for id : ${id}`, Status.NOT_FOUND);
  }
  return { message: "Vehicle deleted successfully." };
};
