import { Router } from "express";
import { verifyPin, getPinStatus } from "@controllers/pinController.js";
import { asyncHandler, validationHandler } from "@middleware/index.js";
import { stringValidator } from "@middleware/validationHandler.js";

const router = Router();

router.post(
  "/verify",
  validationHandler([stringValidator("pin")]),
  asyncHandler(verifyPin)
);
router.get("/status", asyncHandler(getPinStatus));

export default router;
