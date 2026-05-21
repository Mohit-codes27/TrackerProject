import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createCodingLogSchema, updateCodingLogSchema } from "./coding.schema";
import { createLog, getLogs, getLog, updateLog, deleteLog } from "./coding.controller";

const router = Router();

router.post("/", protect, validate(createCodingLogSchema), createLog);
router.get("/", protect, getLogs);
router.get("/:id", protect, getLog);
router.put("/:id", protect, validate(updateCodingLogSchema), updateLog);
router.delete("/:id", protect, deleteLog);

export default router;