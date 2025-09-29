import { Router } from "express";
import {
  addInsurance,
  getInsurances,
  updateInsurance,
  deleteInsurance,
} from "@controllers/insuranceController.js";
import { asyncHandler, validationHandler } from "@middleware/index.js";
import {
  dateValidator,
  floatValidator,
  idValidator,
  stringValidator,
} from "@middleware/validationHandler.js";

const router = Router({ mergeParams: true });

router.post(
  "/",
  validationHandler([
    idValidator("vehicleId"),
    stringValidator("provider"),
    stringValidator("policyNumber"),
    dateValidator("startDate"),
    dateValidator("endDate"),
    floatValidator("cost"),
  ]),
  asyncHandler(addInsurance)
);
router.get(
  "/",
  validationHandler([idValidator("vehicleId")]),
  asyncHandler(getInsurances)
);
router.put(
  "/:id",
  validationHandler([
    idValidator("vehicleId"),
    idValidator("id"),
    stringValidator("provider"),
    stringValidator("policyNumber"),
    dateValidator("startDate"),
    dateValidator("endDate"),
    floatValidator("cost"),
  ]),
  asyncHandler(updateInsurance)
);
router.delete(
  "/:id",
  validationHandler([idValidator("vehicleId"), idValidator("id")]),
  asyncHandler(deleteInsurance)
);

export default router;
