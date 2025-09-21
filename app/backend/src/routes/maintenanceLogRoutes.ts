import { Router } from "express";
import {
  addMaintenanceLog,
  getMaintenanceLogs,
  getMaintenanceLogById,
  updateMaintenanceLog,
  deleteMaintenanceLog,
} from "@controllers/maintenanceLogController.js";
import { authenticatePin } from "@middleware/auth.js";
import { asyncHandler } from "@middleware/async-handler.js";

const router = Router({ mergeParams: true });

router.post("/", authenticatePin, asyncHandler(addMaintenanceLog));
router.get("/", authenticatePin, asyncHandler(getMaintenanceLogs));
router.get("/:id", authenticatePin, asyncHandler(getMaintenanceLogById));
router.put("/:id", authenticatePin, asyncHandler(updateMaintenanceLog));
router.delete("/:id", authenticatePin, asyncHandler(deleteMaintenanceLog));

export default router;
