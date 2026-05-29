import { db } from "../../db";
import { codingLogs, projectLogs } from "../../db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm"
import { getCurrentWeekRange } from "../../utils/date.utils";

export const getWeeklySummary = async (userId: string) => {
    const { startOfWeek, endOfWeek } = getCurrentWeekRange();

    const codingStats = await db
        .select({
            difficulty: codingLogs.difficulty,
            count: sql<number>`COUNT(*)::int`.as("count"),
        })
        .from(codingLogs)
        .where(
            and(
                eq(codingLogs.userId, userId),
                gte(codingLogs.solvedAt, startOfWeek),
                lte(codingLogs.solvedAt, endOfWeek)
            )
        )
        .groupBy(codingLogs.difficulty);

    let easy = 0, medium = 0, hard = 0;
    codingStats.forEach((stat) => {
        if (stat.difficulty === "Easy") easy = stat.count;
        if (stat.difficulty === "Medium") medium = stat.count;
        if (stat.difficulty === "Hard") hard = stat.count;
    })

    const totalProblems = easy + medium + hard;

    const projectStats = await db
        .select({
            totalHours: sql<number>`COALESCE(SUM(${projectLogs.hoursLogged}), 0)::float`.as("totalHours"),
        })
        .from(projectLogs)
        .where(
            and(
                eq(projectLogs.userId, userId),
                gte(projectLogs.loggedAt, startOfWeek),
                lte(projectLogs.loggedAt, endOfWeek),
            )
        )

    const totalProjectHours = projectStats[0]?.totalHours ?? 0;

    const productivityScore = easy * 1 + medium * 2 + hard * 3 + totalProjectHours * 2;

    return {
        totalProblems,
        easy,
        medium,
        hard,
        totalProjectHours,
        productivityScore,
        weekStart: startOfWeek,
        weekEnd: endOfWeek,
    };
};