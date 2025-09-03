import { Router } from "express";
import {
  addInsurance,
  getInsurances,
  updateInsurance,
  deleteInsurance,
} from "@controllers/InsuranceController.js";
import { authenticatePin } from "@middleware/auth.js";
import { asyncHandler } from "@middleware/async-handler.js";

const router = Router({ mergeParams: true });

router.post("/", authenticatePin, asyncHandler(addInsurance));
router.get("/", authenticatePin, asyncHandler(getInsurances));
router.put("/:id", authenticatePin, asyncHandler(updateInsurance));
router.delete("/:id", authenticatePin, asyncHandler(deleteInsurance));

export default router;
