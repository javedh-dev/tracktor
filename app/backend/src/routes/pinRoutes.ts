import { Router } from "express";
import { verifyPin, getPinStatus } from "@controllers/pinController.js";
import { asyncHandler } from "@middleware/index.js";

const router = Router();

router.post("/verify", asyncHandler(verifyPin));
router.get("/status", asyncHandler(getPinStatus));

export default router;
