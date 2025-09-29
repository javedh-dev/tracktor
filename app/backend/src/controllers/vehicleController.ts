import { Request, Response } from "express";
import * as vehicleService from "@services/vehicleService.js";

export const addVehicle = async (req: Request, res: Response) => {
  const result = await vehicleService.addVehicle(req.body);
  res.status(201).json(result);
};

export const getAllVehicles = async (req: Request, res: Response) => {
  const vehicles = await vehicleService.getAllVehicles();
  res.status(200).json(vehicles);
};

export const getVehicleById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const vehicle = await vehicleService.getVehicleById(id as string);
  res.status(200).json(vehicle);
};

export const updateVehicle = async (req: Request, res: Response) => {
  const { id } = req.body;
  const result = await vehicleService.updateVehicle(id, req.body);
  res.status(200).json(result);
};

export const deleteVehicle = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await vehicleService.deleteVehicle(id as string);
  res.status(200).json(result);
};
