import { Router } from "express";
import {
  addVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} from "@controllers/VehicleController.js";
import { authenticatePin } from "@middleware/auth.js";
import { asyncHandler } from "@middleware/async-handler.js";
import fuelLogRoutes from "./fuelLogRoutes.js";
import fuelLogLPRoutes from "./fuelLogLPRoutes.js";
import insuranceRoutes from "./insuranceRoutes.js";
import maintenanceLogRoutes from "./maintenanceLogRoutes.js";
import puccRoutes from "./puccRoutes.js";

const router = Router();

router.post("/", authenticatePin, asyncHandler(addVehicle));
router.get("/", authenticatePin, asyncHandler(getAllVehicles));
router.get("/:id", authenticatePin, asyncHandler(getVehicleById));
router.put("/", authenticatePin, asyncHandler(updateVehicle));
router.delete("/:id", authenticatePin, asyncHandler(deleteVehicle));

router.use("/:vehicleId/fuel-logs", fuelLogRoutes);
router.use("/lp/:licensePlate/fuel-logs", fuelLogLPRoutes);
router.use("/:vehicleId/insurance", insuranceRoutes);
router.use("/:vehicleId/maintenance-logs", maintenanceLogRoutes);
router.use("/:vehicleId/pucc", puccRoutes);

export default router;
