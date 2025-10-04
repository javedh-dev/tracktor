import { Router } from "express";
import {
  addMaintenanceLog,
  getMaintenanceLogs,
  getMaintenanceLogById,
  updateMaintenanceLog,
  deleteMaintenanceLog,
} from "@controllers/maintenanceLogController";
import { asyncHandler, validationHandler } from "../middlewares/index";
import {
  dateValidator,
  floatValidator,
  idValidator,
  stringValidator,
} from "../middlewares/validationHandler";

const router = Router({ mergeParams: true });

router.post(
  "/",
  validationHandler([
    idValidator("vehicleId"),
    dateValidator("date"),
    floatValidator("odometer"),
    stringValidator("serviceCenter"),
    floatValidator("cost"),
  ]),
  asyncHandler(addMaintenanceLog)
);

router.get(
  "/",
  validationHandler([idValidator("vehicleId")]),
  asyncHandler(getMaintenanceLogs)
);

router.get(
  "/:id",
  validationHandler([idValidator("vehicleId"), idValidator("id")]),
  asyncHandler(getMaintenanceLogById)
);

router.put(
  "/:id",
  validationHandler([
    idValidator("vehicleId"),
    idValidator("id"),
    dateValidator("date"),
    floatValidator("odometer"),
    stringValidator("serviceCenter"),
    floatValidator("cost"),
  ]),
  asyncHandler(updateMaintenanceLog)
);

router.delete(
  "/:id",
  validationHandler([idValidator("vehicleId"), idValidator("id")]),
  asyncHandler(deleteMaintenanceLog)
);

export default router;
