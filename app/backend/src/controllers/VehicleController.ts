import { Request, Response } from "express";
import * as vehicleService from "@services/vehicleService.js";
import { VehicleError } from "@exceptions/VehicleError.js";
import { Status } from "@exceptions/ServiceError.js";

export const addVehicle = async (req: Request, res: Response) => {
  const { make, model, year, licensePlate } = req.body;
  if (!make || !model || !year || !licensePlate) {
    new VehicleError(
      "Make, Model, Year, and License Plate are required.",
      Status.BAD_REQUEST,
    );
  }
  const result = await vehicleService.addVehicle(req.body);
  res.status(201).json(result);
};

export const getAllVehicles = async (req: Request, res: Response) => {
  const vehicles = await vehicleService.getAllVehicles();
  res.status(200).json(vehicles);
};

export const getVehicleById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new VehicleError("Vehicle ID is required.", Status.BAD_REQUEST);
  }
  const vehicle = await vehicleService.getVehicleById(id);
  res.status(200).json(vehicle);
};

export const updateVehicle = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { make, model, year, licensePlate } = req.body;

  if (!make || !model || !year || !licensePlate) {
    throw new VehicleError(
      "Make, Model, Year, and License Plate are required.",
      Status.BAD_REQUEST,
    );
  }
  if (!id) {
    throw new VehicleError("Vehicle ID is required.", Status.BAD_REQUEST);
  }
  const result = await vehicleService.updateVehicle(id, req.body);
  res.status(200).json(result);
};

export const deleteVehicle = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new VehicleError("Vehicle ID is required.", Status.BAD_REQUEST);
  }

  const result = await vehicleService.deleteVehicle(id);
  res.status(200).json(result);
};
