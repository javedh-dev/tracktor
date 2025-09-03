import { Router } from "express";
import {
  addMaintenanceLog,
  getMaintenanceLogs,
  getMaintenanceLogById,
  updateMaintenanceLog,
  deleteMaintenanceLog,
} from "@controllers/MaintenanceLogController.js";
import { authenticatePin } from "@middleware/auth.js";

const router = Router({ mergeParams: true });

router.post("/", authenticatePin, addMaintenanceLog);
router.get("/", authenticatePin, getMaintenanceLogs);
router.get("/:id", authenticatePin, getMaintenanceLogById);
router.put("/:id", authenticatePin, updateMaintenanceLog);
router.delete("/:id", authenticatePin, deleteMaintenanceLog);

export default router;
