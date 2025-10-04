import { Router } from "express";
import { verifyPin, getPinStatus } from "@controllers/pinController";
import { asyncHandler, validationHandler } from "../middlewares/index";
import { stringValidator } from "../middlewares/validationHandler";

const router = Router();

router.post(
  "/verify",
  validationHandler([stringValidator("pin")]),
  asyncHandler(verifyPin)
);
router.get("/status", asyncHandler(getPinStatus));

export default router;
