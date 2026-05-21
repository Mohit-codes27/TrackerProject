import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { streak, topicDistribution, weeklyTrend } from "./analytics.controller";

const router = Router();

router.get("/streak", protect, streak);
router.get("/topics", protect, topicDistribution);
router.get("/weekly-trend", protect, weeklyTrend);

export default router;