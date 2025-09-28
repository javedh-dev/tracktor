import { Router } from "express";
import {
  addFuelLog,
  getFuelLogs,
  getFuelLogById,
  updateFuelLog,
  deleteFuelLog,
} from "@controllers/fuelLogController.js";
import { asyncHandler } from "@middleware/index.js";

// TODO: Enable by licence plate number

// import {
//   addFuelLogByLicensePlate,
//   getFuelLogsByLicensePlate,
// } from "@services/fuelLogService.js";

const router = Router({ mergeParams: true });

router.post("/", asyncHandler(addFuelLog));
router.get("/", asyncHandler(getFuelLogs));
router.get("/:id", asyncHandler(getFuelLogById));
router.put("/:id", asyncHandler(updateFuelLog));
router.delete("/:id", asyncHandler(deleteFuelLog));
// router.post("/:lpn", asyncHandler(addFuelLogByLicensePlate));
// router.get("/:lpn", asyncHandler(getFuelLogsByLicensePlate));

export default router;
