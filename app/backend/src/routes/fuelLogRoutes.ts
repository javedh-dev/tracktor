import { Router } from "express";
import {
  addFuelLog,
  getFuelLogs,
  getFuelLogById,
  updateFuelLog,
  deleteFuelLog,
} from "@controllers/fuelLogController.js";
import { authenticatePin } from "@middleware/auth.js";
import { asyncHandler } from "@middleware/async-handler.js";

const router = Router({ mergeParams: true });

router.post("/", authenticatePin, asyncHandler(addFuelLog));
router.get("/", authenticatePin, asyncHandler(getFuelLogs));
router.get("/:id", authenticatePin, asyncHandler(getFuelLogById));
router.put("/:id", authenticatePin, asyncHandler(updateFuelLog));
router.delete("/:id", authenticatePin, asyncHandler(deleteFuelLog));

export default router;
