import { Router } from "express";
import {
  addMaintenanceLog,
  getMaintenanceLogs,
  getMaintenanceLogById,
  updateMaintenanceLog,
  deleteMaintenanceLog,
} from "@controllers/maintenanceLogController.js";
import { asyncHandler } from "@middleware/index.js";

const router = Router({ mergeParams: true });

router.post("/", asyncHandler(addMaintenanceLog));
router.get("/", asyncHandler(getMaintenanceLogs));
router.get("/:id", asyncHandler(getMaintenanceLogById));
router.put("/:id", asyncHandler(updateMaintenanceLog));
router.delete("/:id", asyncHandler(deleteMaintenanceLog));

export default router;
