import { Router } from "express";
import {
  addPollutionCertificate,
  getPollutionCertificates,
  updatePollutionCertificate,
  deletePollutionCertificate,
} from "@controllers/puccController.js";
import { authenticatePin } from "@middleware/auth.js";
import { asyncHandler } from "@middleware/async-handler.js";

const router = Router({ mergeParams: true });

router.post("/", authenticatePin, asyncHandler(addPollutionCertificate));
router.get("/", authenticatePin, asyncHandler(getPollutionCertificates));
router.put("/:id", authenticatePin, asyncHandler(updatePollutionCertificate));
router.delete(
  "/:id",
  authenticatePin,
  asyncHandler(deletePollutionCertificate),
);

export default router;
