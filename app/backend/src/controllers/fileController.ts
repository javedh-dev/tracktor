import { env } from "@config/env";
import { AppError, Status } from "@exceptions/AppError";
import { Request, Response } from "express";
import path from "path";

export const uploadFile = async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    throw new AppError("File is missing to be uploaded", Status.BAD_REQUEST);
  }

  res.json({
    success: true,
    message: "File uploaded successfully",
    data: {
      filename: file?.filename,
      originalName: file?.originalname,
      size: file?.size,
      mimetype: file?.mimetype,
    },
  });
};

export const downloadFile = async (req: Request, res: Response) => {
  const { filename } = req.params;
  const filePath = path.join(env.UPLOADS_DIR, filename || "");

  res.sendFile(filePath, { root: process.cwd() }, (err) => {
    if (err) {
      res.status(404).json({
        success: false,
        message: "File not found",
      });
    }
  });
};
