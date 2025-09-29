import logger from "@utils/logger.js";
import { Request, Response, NextFunction } from "express";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _: NextFunction
) => {
  logger.error(`Error in ${req.method} - ${req.path}`, err);

  res.setHeader("Content-Type", "application/json");

  let statusCode = 500;
  let body = {};

  switch (err.name) {
    case "SequelizeValidationError":
      statusCode = 400;
      body = {
        type: "ValidationError",
        errors: err.errors.map((e: any) => ({
          message: e.message,
          path: e.path,
        })),
      };
      break;
    case "AuthError":
      // Use the status from the error if available, otherwise default to 500
      statusCode = err.status || 500;
      body = {
        type: "AuthError",
        errors: [{ message: err.message }],
      };
      break;
    default:
      // Check if error has a status property
      statusCode = err.status || err.statusCode || 500;
      body = {
        type: err.name || "Error",
        errors: [{ message: err.message || "Internal server error" }],
      };
  }

  res.status(statusCode).json(body);
};

export default errorHandler;
