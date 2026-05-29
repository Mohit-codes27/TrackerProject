import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { getWeeklySummary } from "./dashboard.service";
import { generateWeeklyInsight } from "./insight.service";
import { db } from "../../db";
import { insightHistory } from "../../db/schema";

export const weeklySummary = asyncHandler(async (req: Request, res: Response) => {
    const summary = await getWeeklySummary(req.user!.id);
    const insight = await generateWeeklyInsight(summary);

    await db.insert(insightHistory).values({
        userId: req.user!.id,
        period: "weekly",
        summaryData: JSON.stringify(summary),
        aiInsight: insight,
    });

    res.status(200).json({
        success: true,
        summary,
        insight,
    })
})