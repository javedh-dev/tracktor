import { Router } from "express";
import {
  addFuelLog,
  getFuelLogs,
  getFuelLogById,
  updateFuelLog,
  deleteFuelLog,
} from "@controllers/fuelLogController";
import { asyncHandler, validationHandler } from "../middlewares/index";
import {
  dateValidator,
  floatValidator,
  idValidator,
} from "../middlewares/validationHandler";

// TODO: Enable by licence plate number

// import {
//   addFuelLogByLicensePlate,
//   getFuelLogsByLicensePlate,
// } from "@services/fuelLogService";

const router = Router({ mergeParams: true });

router.post(
  "/",
  validationHandler([
    idValidator("vehicleId"),
    dateValidator("date"),
    floatValidator("odometer"),
    floatValidator("fuelAmount"),
    floatValidator("cost"),
  ]),
  asyncHandler(addFuelLog)
);

router.get(
  "/",
  validationHandler([idValidator("vehicleId")]),
  asyncHandler(getFuelLogs)
);

router.get(
  "/:id",
  validationHandler([idValidator("vehicleId"), idValidator("id")]),
  asyncHandler(getFuelLogById)
);

router.put(
  "/:id",
  validationHandler([
    idValidator("vehicleId"),
    idValidator("id"),
    dateValidator("date"),
    floatValidator("odometer"),
    floatValidator("fuelAmount"),
    floatValidator("cost"),
  ]),
  asyncHandler(updateFuelLog)
);
router.delete(
  "/:id",
  validationHandler([idValidator("id")]),
  asyncHandler(deleteFuelLog)
);
// router.post("/:lpn", asyncHandler(addFuelLogByLicensePlate));
// router.get("/:lpn", asyncHandler(getFuelLogsByLicensePlate));

export default router;
