import { Router } from "express";
import {
  addFuelLog,
  getFuelLogs,
  getFuelLogById,
  updateFuelLog,
  deleteFuelLog,
} from "@controllers/FuelLogController.js";
import { authenticatePin } from "@middleware/auth.js";

const router = Router({ mergeParams: true });

router.post("/", authenticatePin, addFuelLog);
router.get("/", authenticatePin, getFuelLogs);
router.get("/:id", authenticatePin, getFuelLogById);
router.put("/:id", authenticatePin, updateFuelLog);
router.delete("/:id", authenticatePin, deleteFuelLog);

export default router;
