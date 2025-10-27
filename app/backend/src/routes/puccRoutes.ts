import { Router } from "express";
import {
  addPucc,
  getPuccs,
  getPuccById,
  updatePucc,
  deletePucc,
} from "@controllers/puccController";
import { asyncHandler, validationHandler } from "../middlewares/index";
import {
  dateValidator,
  idValidator,
  stringValidator,
} from "../middlewares/validationHandler";

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
  asyncHandler(addPucc),
);

router.get(
  "/",
  validationHandler([idValidator("vehicleId")]),
  asyncHandler(getPuccs),
);

router.get(
  "/:id",
  validationHandler([idValidator("vehicleId"), idValidator("id")]),
  asyncHandler(getPuccById),
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
  asyncHandler(updatePucc),
);

router.delete(
  "/:id",
  validationHandler([idValidator("vehicleId"), idValidator("id")]),
  asyncHandler(deletePucc),
);

export default router;
