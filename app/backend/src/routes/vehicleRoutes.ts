import { Router } from "express";
import {
  addVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} from "@controllers/vehicleController.js";
import { asyncHandler, validationHandler } from "@middleware/index.js";
import fuelLogRoutes from "./fuelLogRoutes.js";
import insuranceRoutes from "./insuranceRoutes.js";
import maintenanceLogRoutes from "./maintenanceLogRoutes.js";
import puccRoutes from "./puccRoutes.js";
import {
  idValidator,
  numberValidator,
  stringValidator,
} from "@middleware/validationHandler.js";

const router = Router();

router.post(
  "/",
  validationHandler([
    stringValidator("make"),
    stringValidator("model"),
    numberValidator("year"),
    stringValidator("licensePlate"),
  ]),
  asyncHandler(addVehicle)
);
router.get("/", asyncHandler(getAllVehicles));
router.get(
  "/:id",
  validationHandler([idValidator("id")]),
  asyncHandler(getVehicleById)
);
router.put(
  "/",
  validationHandler([
    idValidator("id"),
    stringValidator("make"),
    stringValidator("model"),
    numberValidator("year"),
    stringValidator("licensePlate"),
  ]),
  asyncHandler(updateVehicle)
);
router.delete(
  "/:id",
  validationHandler([idValidator("id")]),
  asyncHandler(deleteVehicle)
);

router.use("/:vehicleId/fuel-logs", fuelLogRoutes);
router.use("/:vehicleId/insurance", insuranceRoutes);
router.use("/:vehicleId/maintenance-logs", maintenanceLogRoutes);
router.use("/:vehicleId/pucc", puccRoutes);

export default router;
