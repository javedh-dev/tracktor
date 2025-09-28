import { Router } from "express";
import {
  addPollutionCertificate,
  getPollutionCertificates,
  updatePollutionCertificate,
  deletePollutionCertificate,
} from "@controllers/puccController.js";
import { asyncHandler } from "@middleware/index.js";

const router = Router({ mergeParams: true });

router.post("/", asyncHandler(addPollutionCertificate));
router.get("/", asyncHandler(getPollutionCertificates));
router.put("/:id", asyncHandler(updatePollutionCertificate));
router.delete("/:id", asyncHandler(deletePollutionCertificate));

export default router;
