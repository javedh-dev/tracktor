import { Router } from "express";
import {
  uploadHandler,
  asyncHandler,
  validationHandler,
} from "../middlewares/index";
import { fileNameValidator } from "@middlewares/validationHandler";
import { downloadFile, uploadFile } from "@controllers/fileController";

const router = Router({ mergeParams: true });

router.post("/", uploadHandler.single("file"), asyncHandler(uploadFile));

router.get(
  "/:filename",
  validationHandler([fileNameValidator("filename")]),
  asyncHandler(downloadFile),
);

export default router;
