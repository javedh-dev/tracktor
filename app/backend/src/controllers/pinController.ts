import { Request, Response } from "express";
import * as pinService from "@services/pinService.js";
import { AuthError } from "@exceptions/AuthError.js";
import { Status } from "@exceptions/ServiceError.js";

export const setPin = async (req: Request, res: Response) => {
  const { pin } = req.body;
  if (!pin || pin.length !== 6 || !/^\d+$/.test(pin)) {
    throw new AuthError("PIN must be a 6-digit number.", Status.BAD_REQUEST);
  }
  const result = await pinService.setPin(pin);
  res.status(200).json({ message: result.message });
};

export const verifyPin = async (req: Request, res: Response) => {
  const { pin } = req.body;
  if (!pin) {
    throw new AuthError("PIN is required.", Status.BAD_REQUEST);
  }
  const result = await pinService.verifyPin(pin);
  res.status(200).json({ message: result.message });
};

export const getPinStatus = async (req: Request, res: Response) => {
  const result = await pinService.getPinStatus();
  res.status(200).json(result);
};
