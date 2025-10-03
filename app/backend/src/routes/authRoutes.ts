import { Router } from "express";
import { verifyPin, getPinStatus } from "@controllers/pinController";
import { asyncHandler, validationHandler } from "@middleware/index";
import { stringValidator } from "@middleware/validationHandler";

const router = Router();

router.post(
  "/verify",
  validationHandler([stringValidator("pin")]),
  asyncHandler(verifyPin)
);
router.get("/status", asyncHandler(getPinStatus));

export default router;
