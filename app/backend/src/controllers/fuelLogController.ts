import { Request, Response } from "express";
import * as fuelLogService from "@services/fuelLogService";

export const addFuelLog = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;
  const result = await fuelLogService.addFuelLog(vehicleId as string, req.body);
  res.status(201).json(result);
};

export const getFuelLogs = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;
  const fuelLogs = await fuelLogService.getFuelLogs(vehicleId as string);
  res.status(200).json(fuelLogs);
};

export const getFuelLogById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const fuelLog = await fuelLogService.getFuelLogById(id as string);
  res.status(200).json(fuelLog);
};

export const updateFuelLog = async (req: Request, res: Response) => {
  const { vehicleId, id } = req.params;
  const result = await fuelLogService.updateFuelLog(
    vehicleId as string,
    id as string,
    req.body
  );
  res.status(200).json(result);
};

export const deleteFuelLog = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await fuelLogService.deleteFuelLog(id as string);
  res.status(200).json(result);
};

// Add FuelLog by licensePlate
export const addFuelLogByLicensePlate = async (req: Request, res: Response) => {
  const { licensePlate } = req.params;
  const result = await fuelLogService.addFuelLogByLicensePlate(
    licensePlate as string,
    req.body
  );
  res.status(201).json(result);
};

// Get FuelLogs by licensePlate
export const getFuelLogsByLicensePlate = async (
  req: Request,
  res: Response
) => {
  const { licensePlate } = req.params;
  const fuelLogs = await fuelLogService.getFuelLogsByLicensePlate(
    licensePlate as string
  );
  res.status(200).json(fuelLogs);
};
