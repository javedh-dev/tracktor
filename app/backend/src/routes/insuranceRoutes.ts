import { Router } from "express";
import {
  addInsurance,
  getInsurances,
  getInsuranceById,
  updateInsurance,
  deleteInsurance,
} from "@controllers/insuranceController";
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
router.get(
  "/:id",
  validationHandler([idValidator("vehicleId"), idValidator("id")]),
  asyncHandler(getInsuranceById)
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
