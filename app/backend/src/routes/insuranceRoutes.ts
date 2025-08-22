import { Router } from "express";
import {
  addInsurance,
  getInsurances,
  updateInsurance,
  deleteInsurance,
} from "@controllers/InsuranceController.js";
import { authenticatePin } from "@middleware/auth.js";

const router = Router({ mergeParams: true });

router.post("/", authenticatePin, addInsurance);
router.get("/", authenticatePin, getInsurances);
router.put("/:id", authenticatePin, updateInsurance);
router.delete("/:id", authenticatePin, deleteInsurance);

export default router;
