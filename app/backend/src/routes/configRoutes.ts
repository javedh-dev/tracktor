import { Router } from "express";
import {
  getConfig,
  getConfigByKey,
  updateConfig,
} from "@controllers/ConfigController.js";

const router = Router();

router.get("/", getConfig);
router.get("/:key", getConfigByKey); // Alias for getConfig
router.put("/", updateConfig);

export default router;
