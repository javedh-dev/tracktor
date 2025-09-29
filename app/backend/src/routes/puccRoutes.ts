import { Router } from "express";
import {
  addPollutionCertificate,
  getPollutionCertificates,
  updatePollutionCertificate,
  deletePollutionCertificate,
} from "@controllers/puccController.js";
import { asyncHandler, validationHandler } from "@middleware/index.js";
import {
  dateValidator,
  idValidator,
  stringValidator,
} from "@middleware/validationHandler.js";

const router = Router({ mergeParams: true });

router.post(
  "/",
  validationHandler([
    idValidator("vehicleId"),
    stringValidator("certificateNumber"),
    dateValidator("issueDate"),
    dateValidator("expiryDate"),
    stringValidator("testingCenter"),
  ]),
  asyncHandler(addPollutionCertificate)
);

router.get(
  "/",
  validationHandler([idValidator("vehicleId")]),
  asyncHandler(getPollutionCertificates)
);

router.put(
  "/:id",
  validationHandler([
    idValidator("vehicleId"),
    idValidator("id"),
    stringValidator("certificateNumber"),
    dateValidator("issueDate"),
    dateValidator("expiryDate"),
    stringValidator("testingCenter"),
  ]),
  asyncHandler(updatePollutionCertificate)
);

router.delete(
  "/:id",
  validationHandler([idValidator("vehicleId"), idValidator("id")]),
  asyncHandler(deletePollutionCertificate)
);

export default router;
