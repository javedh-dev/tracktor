import { Request, Response } from "express";
import * as fuelLogService from "@services/fuelLogService.js";
import { FuelLogError } from "@exceptions/FuelLogError.js";
import { Status } from "@exceptions/ServiceError.js";

export const addFuelLog = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;
  const { date, odometer, fuelAmount, cost } = req.body;

  if (!date || !odometer || !fuelAmount || !cost) {
    throw new FuelLogError(
      "Date, Odometer, Fuel Amount, and Cost are required in request body.",
      Status.BAD_REQUEST,
    );
  }
  if (!vehicleId) {
    throw new FuelLogError("Vehicle id is required.", Status.BAD_REQUEST);
  }

  const result = await fuelLogService.addFuelLog(vehicleId, req.body);
  res.status(201).json(result);
};

export const getFuelLogs = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;
  if (!vehicleId) {
    throw new FuelLogError("Vehicle id is required.", Status.BAD_REQUEST);
  }
  const fuelLogs = await fuelLogService.getFuelLogs(vehicleId);
  res.status(200).json(fuelLogs);
};

export const getFuelLogById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new FuelLogError("Fuel Log id is required.", Status.BAD_REQUEST);
  }
  const fuelLog = await fuelLogService.getFuelLogById(id);
  res.status(200).json(fuelLog);
};

export const updateFuelLog = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { date, odometer, fuelAmount, cost } = req.body;
  if (!date || !odometer || !fuelAmount || !cost) {
    throw new FuelLogError(
      "Date, Odometer, Fuel Amount, and Cost are required.",
      Status.BAD_REQUEST,
    );
  }
  if (!id) {
    throw new FuelLogError("Fuel log ID is required.", Status.BAD_REQUEST);
  }
  const result = await fuelLogService.updateFuelLog(id, req.body);
  res.status(200).json(result);
};

export const deleteFuelLog = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new FuelLogError("Fuel Log id is required.", Status.BAD_REQUEST);
  }
  const result = await fuelLogService.deleteFuelLog(id);
  res.status(200).json(result);
};
