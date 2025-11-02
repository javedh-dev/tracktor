import { AppValidationError } from "@exceptions/AppValidationError";
import { NextFunction, Request, Response } from "express";
import {
  body,
  buildCheckFunction,
  param,
  ValidationChain,
} from "express-validator";

// can be reused by many routes
const validationHandler = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (!result.isEmpty()) {
        throw new AppValidationError(result.array());
      }
    }

    next();
  };
};

export const idValidator = (key: string) =>
  buildCheckFunction(["body", "params"])(key)
    .isUUID()
    .withMessage(`${key} must be a valid UUID`);

export const dateValidator = (key: string) =>
  body(key).isISO8601().withMessage(`${key} must be in ISO 8601 format`);

export const floatValidator = (key: string) =>
  body(key).isFloat({ gt: 0 }).withMessage(`${key} must be a positive number`);

export const numberValidator = (key: string) =>
  body(key).isInt().withMessage(`${key} must be a integer number`);

export const stringValidator = (key: string) =>
  buildCheckFunction(["body", "params"])(key)
    .isString()
    .trim()
    .notEmpty()
    .withMessage(`${key} must be an non-empty string`);

export const optionalStringValidator = (key: string) =>
  buildCheckFunction(["body", "params"])(key)
    .optional({ nullable: true })
    .isString()
    .trim()
    .withMessage(`${key} must be a string if provided`);

export const fileNameValidator = (key: string) =>
  param(key)
    .isString()
    .matches("^[0-9a-fA-F-]+\\.[a-z]+$")
    .withMessage(`${key} must have UUID based name`);

export const fuelTypeValidator = (key: string) =>
  body(key)
    .isIn(["petrol", "diesel", "ev", "hybrid"])
    .withMessage(`${key} must be one of: petrol, diesel, ev, hybrid`);

export default validationHandler;
