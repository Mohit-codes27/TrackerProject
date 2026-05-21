import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { getStreak, getTopicDistribution, getWeeklyTrend } from "./analytics.service";
import { success } from "zod";
import { get } from "node:http";

export const streak = asyncHandler(async(req: Request, res: Response)=>{
    const data = await getStreak(req.user!.id);
    res.status(200).json({success: true, data});
})

export const topicDistribution = asyncHandler(async(req: Request, res: Response)=>{
    const data = await getTopicDistribution(req.user!.id);
    res.status(200).json({success: true, data});
})

export const weeklyTrend = asyncHandler(async(req: Request, res: Response)=>{
    const data = await getWeeklyTrend(req.user!.id);
    res.status(200).json({success: true, data});
})