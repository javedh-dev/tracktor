import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import Auth from "@models/Auth.js";

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
    const user = await Auth.findByPk(1);
    if (!user) {
      return res
        .status(401)
        .json({ message: "PIN is not set. Please set the PIN first." });
    }
    if (!user.hash) {
      console.error("User found but hash is missing. Data integrity issue.");
      return res
        .status(500)
        .json({ message: "Server error: User hash not found." });
    }

    const match = await bcrypt.compare(pin, user.hash);
    if (match) {
      next();
    } else {
      res.status(401).json({ message: "Invalid PIN." });
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error authenticating PIN.", error: error.message });
  }
};
