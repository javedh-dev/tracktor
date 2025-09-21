import { Request, Response } from "express";
import * as maintenanceLogService from "@services/maintenanceLogService.js";
import { MaintenanceLogError } from "@exceptions/MaintenanceLogError.js";
import { Status } from "@exceptions/ServiceError.js";

export const addMaintenanceLog = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;
  const { date, odometer, serviceCenter, cost } = req.body;

  if (!vehicleId) {
    throw new MaintenanceLogError(
      "Vehicle ID is required.",
      Status.BAD_REQUEST,
    );
  }
  if (
    !date ||
    !odometer ||
    !serviceCenter ||
    cost === undefined ||
    cost === null
  ) {
    throw new MaintenanceLogError(
      "Date, Odometer, ServiceCenter, and Cost are required.",
      Status.BAD_REQUEST,
    );
  }
  const result = await maintenanceLogService.addMaintenanceLog(
    vehicleId,
    req.body,
  );
  res.status(201).json(result);
};

export const getMaintenanceLogs = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;
  if (!vehicleId) {
    throw new MaintenanceLogError(
      "Vehicle ID is required.",
      Status.BAD_REQUEST,
    );
  }
  const maintenanceLogs =
    await maintenanceLogService.getMaintenanceLogs(vehicleId);
  res.status(200).json(maintenanceLogs);
};

export const getMaintenanceLogById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new MaintenanceLogError(
      "Maintenance Log ID is required.",
      Status.BAD_REQUEST,
    );
  }

  const maintenanceLog = await maintenanceLogService.getMaintenanceLogById(id);
  res.status(200).json(maintenanceLog);
};

export const updateMaintenanceLog = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { date, odometer, serviceCenter, cost } = req.body;

  if (!id) {
    throw new MaintenanceLogError(
      "Maintenance Log ID is required.",
      Status.BAD_REQUEST,
    );
  }
  if (
    !date ||
    !odometer ||
    !serviceCenter ||
    cost === undefined ||
    cost === null
  ) {
    throw new MaintenanceLogError(
      "Date, Odometer, Service, and Cost are required.",
      Status.BAD_REQUEST,
    );
  }
  const result = await maintenanceLogService.updateMaintenanceLog(id, req.body);
  res.status(200).json(result);
};

export const deleteMaintenanceLog = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new MaintenanceLogError(
      "Maintenance Log ID is required.",
      Status.BAD_REQUEST,
    );
  }

  const result = await maintenanceLogService.deleteMaintenanceLog(id);
  res.status(200).json(result);
};
