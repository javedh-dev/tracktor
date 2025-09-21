import { Router } from "express";
import {
  getConfig,
  getConfigByKey,
  updateConfig,
} from "@controllers/configController.js";
import { asyncHandler } from "@middleware/async-handler.js";

const router = Router();

router.get("/", asyncHandler(getConfig));
router.get("/:key", asyncHandler(getConfigByKey)); // Alias for getConfig
router.put("/", asyncHandler(updateConfig));

export default router;
