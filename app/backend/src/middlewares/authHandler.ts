import { Request, Response, NextFunction } from "express";
import { getPinStatus, verifyPin } from "@services/authService";
import { AppError, Status } from "@exceptions/AppError";

const bypassPaths = ["/api/auth/(\\w)+", "/api/files/(\\w)+"];

const authHandler = async (req: Request, res: Response, next: NextFunction) => {
  for (const path of bypassPaths) {
    if (!req.path.startsWith("/api") || req.path.match(path)) {
      return next();
    }
  }

  const pin = req.headers["x-user-pin"] as string;

  if (!pin) {
    throw new AppError(
      "PIN is required in X-User-PIN header.",
      Status.BAD_REQUEST,
    );
  }

  const user = await getPinStatus();
  if (!user.data.exists) {
    throw new AppError(
      "PIN is not set. Please set the PIN first.",
      Status.BAD_REQUEST,
    );
  }
  await verifyPin(pin);
  next();
};

export default authHandler;
