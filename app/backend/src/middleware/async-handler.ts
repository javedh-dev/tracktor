import { Request, Response, NextFunction } from "express";

// Wrapper to catch async errors and pass them to Express error handler
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => void,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
