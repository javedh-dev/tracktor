import { env, logger } from "@config/index";
import { NextFunction, Request, Response } from "express";

const requestLogger = (req: Request, _: Response, next: NextFunction) => {
  if (env.LOG_REQUESTS) {
    logger.info(
      `${req.method} ${req.originalUrl} - IP: ${req.ip} - Body: ${JSON.stringify(
        req.body,
      )}`,
    );
  }
  next();
};

export default requestLogger;
