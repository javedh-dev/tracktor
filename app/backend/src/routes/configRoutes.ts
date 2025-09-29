import { Router } from "express";
import { getConfig, getConfigByKey, updateConfig } from "@controllers/index.js";
import { asyncHandler, validationHandler } from "@middleware/index.js";
import { body } from "express-validator";
import { stringValidator } from "@middleware/validationHandler.js";

const router = Router();

router.get("/", asyncHandler(getConfig));

router.get(
  "/:key",
  validationHandler([stringValidator("key")]),
  asyncHandler(getConfigByKey)
);

router.put(
  "/",
  validationHandler([
    body()
      .isArray({ min: 1 })
      .withMessage("Request body must be a non-empty array"),
    stringValidator("*.key"),
    stringValidator("*.value"),
  ]),
  asyncHandler(updateConfig)
);

export default router;
