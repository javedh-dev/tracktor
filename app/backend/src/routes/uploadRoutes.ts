import { Router } from "express";
import { uploadHandler, asyncHandler } from "../middlewares/index";

const router = Router({ mergeParams: true });

router.post(
  "/",
  uploadHandler.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    res.json({
      success: true,
      message: "File uploaded successfully",
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  })
);

// Get uploaded file
router.get(
  "/:filename",
  asyncHandler(async (req, res) => {
    const { filename } = req.params;
    const filePath = `./uploads/${filename}`;

    res.sendFile(filePath, { root: process.cwd() }, (err) => {
      if (err) {
        res.status(404).json({
          success: false,
          message: "File not found",
        });
      }
    });
  })
);

export default router;
