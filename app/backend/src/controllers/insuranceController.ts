import { Request, Response } from "express";
import * as insuranceService from "@services/insuranceService";

export const addInsurance = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;
  const result = await insuranceService.addInsurance(
    vehicleId as string,
    req.body
  );
  res.status(201).json(result);
};

export const getInsurances = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;
  const insurances = await insuranceService.getInsurances(vehicleId as string);
  res.status(200).json(insurances);
};

export const updateInsurance = async (req: Request, res: Response) => {
  const { vehicleId, id } = req.params;
  const result = await insuranceService.updateInsurance(
    vehicleId as string,
    id as string,
    req.body
  );
  res.status(200).json(result);
};

export const deleteInsurance = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await insuranceService.deleteInsurance(id as string);
  res.status(200).json(result);
};
