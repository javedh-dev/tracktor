import { NextFunction, Request, Response, json } from "express";

const jsonHandler = (req: Request, res: Response, next: NextFunction) => {
  const errorHandler = (err: Error | null) => {
    if (err instanceof Error) {
      res.status(400).json({
        success: false,
        errors: [err],
        message: "Invalid JSON found",
      });
      return;
    }
    next();
  };

  json()(req, res, errorHandler);
};

export default jsonHandler;
