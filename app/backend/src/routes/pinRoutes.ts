import { RequestHandler, Router } from "express";
import { setPin, verifyPin, getPinStatus } from "@controllers/PinController.js";
import { asyncHandler } from "@middleware/async-handler.js";
import rateLimit from "express-rate-limit";

const router = Router();

const pinVerifyLimiter = rateLimit({
  windowMs:  5 * 1000, // 5 seconds
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many PIN verification attempts, please try again later."
});

router.post("/pin", asyncHandler(setPin));
router.post("/pin/verify", pinVerifyLimiter as unknown as RequestHandler, asyncHandler(verifyPin));
router.get("/pin/status", asyncHandler(getPinStatus));

export default router;
