import { Router } from "express";
import {
  addVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} from "@controllers/vehicleController.js";
import { asyncHandler } from "@middleware/index.js";
import fuelLogRoutes from "./fuelLogRoutes.js";
import insuranceRoutes from "./insuranceRoutes.js";
import maintenanceLogRoutes from "./maintenanceLogRoutes.js";
import puccRoutes from "./puccRoutes.js";

const router = Router();

router.post("/", asyncHandler(addVehicle));
router.get("/", asyncHandler(getAllVehicles));
router.get("/:id", asyncHandler(getVehicleById));
router.put("/", asyncHandler(updateVehicle));
router.delete("/:id", asyncHandler(deleteVehicle));

router.use("/:vehicleId/fuel-logs", fuelLogRoutes);
router.use("/:vehicleId/insurance", insuranceRoutes);
router.use("/:vehicleId/maintenance-logs", maintenanceLogRoutes);
router.use("/:vehicleId/pucc", puccRoutes);

export default router;
