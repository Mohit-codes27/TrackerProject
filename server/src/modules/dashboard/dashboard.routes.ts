import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { weeklySummary } from "./dashboard.controller";

const router = Router();
console.log("Dashboard routes loaded"); // add this
router.get("/weekly-summary", protect, weeklySummary);

export default router;