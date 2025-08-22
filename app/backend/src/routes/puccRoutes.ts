import { Router } from "express";
import {
  addPollutionCertificate,
  getPollutionCertificates,
  updatePollutionCertificate,
  deletePollutionCertificate,
} from "@controllers/PUCCController.js";
import { authenticatePin } from "@middleware/auth.js";

const router = Router({ mergeParams: true });

router.post("/", authenticatePin, addPollutionCertificate);
router.get("/", authenticatePin, getPollutionCertificates);
router.put("/:id", authenticatePin, updatePollutionCertificate);
router.delete("/:id", authenticatePin, deletePollutionCertificate);

export default router;
