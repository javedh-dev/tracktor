import { Request, Response } from "express";
import * as pinService from "@services/pinService.js";

export const verifyPin = async (req: Request, res: Response) => {
  const { pin } = req.body;
  const result = await pinService.verifyPin(pin);
  res.status(200).json({ message: result.message });
};

export const getPinStatus = async (req: Request, res: Response) => {
  const result = await pinService.getPinStatus();
  res.status(200).json(result);
};
