import { Request, Response, NextFunction } from "express";
import { getPinStatus, verifyPin } from "@services/pinService.js";

export const authenticatePin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const pin = req.headers["x-user-pin"] as string;

  if (!pin) {
    return res
      .status(401)
      .json({ message: "PIN is required in X-User-PIN header." });
  }

  try {
    const user = await getPinStatus();
    if (!user.exists) {
      return res
        .status(401)
        .json({ message: "PIN is not set. Please set the PIN first." });
    }
    await verifyPin(pin);
    next();
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error authenticating PIN.", error: error.message });
  }
};
