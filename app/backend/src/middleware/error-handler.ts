import { Request, Response } from "express";
import { ValidationError } from "sequelize";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: any,
) => {
  res.setHeader("Content-Type", "application/json");
  let body = {};
  switch (err.name) {
    case "SequelizeValidationError":
      body = {
        type: "ValidationError",
        errors: err.errors.map((e: any) => {
          return {
            message: e.message,
            path: e.path,
          };
        }),
      };
      break;
    default:
      body = {
        type: err.name,
        errors: [{ message: err.message }],
      };
  }

  console.error(err.name);
  res.status(500);
  res.send(JSON.stringify(body));
};
