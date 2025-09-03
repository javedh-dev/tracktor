import { Router } from "express";
import { setPin, verifyPin, getPinStatus } from "@controllers/PinController.js";

const router = Router();

router.post("/pin", setPin);
router.post("/pin/verify", verifyPin);
router.get("/pin/status", getPinStatus);

export default router;
