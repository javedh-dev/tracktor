import { Request, Response } from "express";
import * as maintenanceLogService from "@services/maintenanceLogService";

export const addMaintenanceLog = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;
  const result = await maintenanceLogService.addMaintenanceLog(
    vehicleId as string,
    req.body
  );
  res.status(201).json(result);
};

export const getMaintenanceLogs = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;
  const maintenanceLogs = await maintenanceLogService.getMaintenanceLogs(
    vehicleId as string
  );
  res.status(200).json(maintenanceLogs);
};

export const getMaintenanceLogById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const maintenanceLog = await maintenanceLogService.getMaintenanceLogById(
    id as string
  );
  res.status(200).json(maintenanceLog);
};

export const updateMaintenanceLog = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await maintenanceLogService.updateMaintenanceLog(
    id as string,
    req.body
  );
  res.status(200).json(result);
};

export const deleteMaintenanceLog = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await maintenanceLogService.deleteMaintenanceLog(id as string);
  res.status(200).json(result);
};
