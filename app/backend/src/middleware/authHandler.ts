import { Request, Response, NextFunction } from "express";
import { getPinStatus, verifyPin } from "@services/pinService.js";
import { logger } from "@utils/index.js";

const bypassPaths = ["/api/pin/(\\w)+", "/api/upload/(\\w)+"];

const authHandler = async (req: Request, res: Response, next: NextFunction) => {
  bypassPaths.forEach((path) => {
    if (req.path.match(path)) {
      return next();
    }
  });

  const pin = req.headers["x-user-pin"] as string;

  if (!pin) {
    logger.error("No PIN provided in request headers.");
    return res
      .status(401)
      .json({ message: "PIN is required in X-User-PIN header." });
  }

  try {
    const user = await getPinStatus();
    if (!user.exists) {
      logger.error("PIN is not set. Access denied.");
      return res
        .status(401)
        .json({ message: "PIN is not set. Please set the PIN first." });
    }
    await verifyPin(pin);
    next();
  } catch (error: any) {
    logger.error("PIN authentication failed:", error.message);
    return res
      .status(500)
      .json({ message: "Error authenticating PIN.", error: error.message });
  }
};

export default authHandler;
