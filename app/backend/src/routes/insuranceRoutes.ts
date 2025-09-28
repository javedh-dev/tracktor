import { Router } from "express";
import {
  addInsurance,
  getInsurances,
  updateInsurance,
  deleteInsurance,
} from "@controllers/insuranceController.js";
import { asyncHandler } from "@middleware/index.js";

const router = Router({ mergeParams: true });

router.post("/", asyncHandler(addInsurance));
router.get("/", asyncHandler(getInsurances));
router.put("/:id", asyncHandler(updateInsurance));
router.delete("/:id", asyncHandler(deleteInsurance));

export default router;
