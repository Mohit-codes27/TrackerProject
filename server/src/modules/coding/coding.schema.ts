import { z } from "zod";

export const createCodingLogSchema = z.object({
    platform: z.enum(["LeetCode", "GFG", "Codeforces"]),
    problemName: z.string().min(1, "Problem name is required"),
    problemLink: z.string().url().optional(),
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
    topic: z.string().min(1, "Topic is required"),
    timeSpentMinutes: z.number().int().min(1, "Time must be at least 1 minute"),
    attempts: z.number().int().min(1, "Attempts must be at least 1"),
    solvedAt: z.string().datetime(),
});

export const updateCodingLogSchema = createCodingLogSchema.partial();

export type CreateCodingLogInput = z.infer<typeof createCodingLogSchema>;
export type UpdateCodingLogInput = z.infer<typeof updateCodingLogSchema>;