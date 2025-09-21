import { Router } from "express";
import {
  addFuelLogByLicensePlate,
  getFuelLogsByLicensePlate,
} from "@controllers/fuelLogController.js";
import { authenticatePin } from "@middleware/auth.js";
import { asyncHandler } from "@middleware/async-handler.js";

const router = Router({ mergeParams: true });

// NEW ROUTES BY LICENSE PLATE
router.post("/", authenticatePin, asyncHandler(addFuelLogByLicensePlate));
router.get("/", authenticatePin, asyncHandler(getFuelLogsByLicensePlate));

export default router;
