import { InsuranceError } from "@exceptions/InsuranceError.js";
import { Status, statusFromError } from "@exceptions/ServiceError.js";
import { Insurance, Vehicle } from "@models/index.js";
import { UniqueConstraintError } from "sequelize";

export const addInsurance = async (vehicleId: string, insuranceData: any) => {
  const vehicle = await Vehicle.findByPk(vehicleId);
  if (!vehicle) {
    throw new InsuranceError(
      `No Vehicle found for id : ${vehicleId}`,
      Status.NOT_FOUND
    );
  }
  const insurance = await Insurance.create({
    ...insuranceData,
    vehicleId: vehicleId,
  });
  return {
    id: insurance.id,
    message: "Insurance details added successfully.",
  };
};

export const getInsurances = async (vehicleId: string) => {
  const insurance = await Insurance.findAll({
    where: { vehicleId: vehicleId },
  });
  if (!insurance) {
    throw new InsuranceError(
      `No Insurances found for vehicle id : ${vehicleId}`,
      Status.NOT_FOUND
    );
  }
  return insurance;
};

export const updateInsurance = async (
  vehicleId: string,
  id: string,
  insuranceData: any
) => {
  const insurance = await Insurance.findOne({
    where: { vehicleId: vehicleId, id },
  });
  if (!insurance) {
    throw new InsuranceError(
      `No Insurances found for id: ${id}`,
      Status.NOT_FOUND
    );
  }
  await insurance.update(insuranceData);
  return { message: "Insurance details updated successfully." };
};

export const deleteInsurance = async (id: string) => {
  const result = await Insurance.destroy({
    where: { id },
  });
  if (result === 0) {
    throw new InsuranceError(
      `No Insurances found for id: ${id}`,
      Status.NOT_FOUND
    );
  }
  return { message: "Insurance details deleted successfully." };
};
