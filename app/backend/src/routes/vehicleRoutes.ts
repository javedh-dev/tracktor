import { Router } from "express";
import {
  addVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} from "@controllers/VehicleController.js";
import { authenticatePin } from "@middleware/auth.js";
import fuelLogRoutes from "./fuelLogRoutes.js";
import insuranceRoutes from "./insuranceRoutes.js";
import maintenanceLogRoutes from "./maintenanceLogRoutes.js";
import puccRoutes from "./puccRoutes.js";

const router = Router();

router.post("/", authenticatePin, addVehicle);
router.get("/", authenticatePin, getAllVehicles);
router.get("/:id", authenticatePin, getVehicleById);
router.put("/:id", authenticatePin, updateVehicle);
router.delete("/:id", authenticatePin, deleteVehicle);

router.use("/:vehicleId/fuel-logs", fuelLogRoutes);
router.use("/:vehicleId/insurance", insuranceRoutes);
router.use("/:vehicleId/maintenance-logs", maintenanceLogRoutes);
router.use("/:vehicleId/pucc", puccRoutes);

export default router;
