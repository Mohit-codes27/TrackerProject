import {db} from "../../db";
import {codingLogs} from "../../db/schema";
import { eq, gte, sql } from "drizzle-orm";

export const getStreak = async(userId: string) =>{
    const rows = await db.selectDistinct({
        solvedDate: sql<string>`DATE(${codingLogs.solvedAt})` .as("solvedDate"),
    })
    .from(codingLogs)
    .where(eq(codingLogs.userId, userId))
    .orderBy(sql`Date(${codingLogs.solvedAt}) DESC`);

    if(rows.length === 0) return { current: 0, best: 0};

    let currentStreak = 1;
    let bestStreak = 1;

    for(let i = 1; i<rows.length; i++){
        const prev = new Date(rows[i-1].solvedDate);
        const curr = new Date(rows[i].solvedDate);
        const diff = (prev.getTime() - curr.getTime()) / (1000*60*60*24);

        if(diff===1){
            currentStreak++;
            bestStreak = Math.max(bestStreak, currentStreak);
        }else{
            break;
        }
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    const lastSolved = new Date(rows[0].solvedDate);
    const daysSinceLast = (today.getTime() - lastSolved.getTime()) / (1000 * 60*60*24);

    if(daysSinceLast>1) currentStreak = 0;
    return { current: currentStreak, best: bestStreak};
}

export const getTopicDistribution = async(userId: string) => {
    const rows = await db
    .select({
        topic: codingLogs.topic,
        count: sql<number>`COUNT(*)::int`.as("count"),
    })
    .from(codingLogs)
    .where(eq(codingLogs.userId, userId))
    .groupBy(codingLogs.topic)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(5);

    return rows;
}

export const getWeeklyTrend = async(userId: string) =>{
    const sixWeeksAgo = new Date();
    sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42);

    const rows = await db
    .select({
        week: sql<string>`TO_CHAR(DATE_TRUNC('week', ${codingLogs.solvedAt}), 'Mon DD')`.as("week"),
        count: sql<number>
`COUNT(*)::int`.as("count"),
    })
    .from(codingLogs)
    .where(
        sql`${codingLogs.userId} = ${userId}::uuid AND ${codingLogs.solvedAt} >= ${sixWeeksAgo.toISOString()}::timestamptz`
    )
    .groupBy(sql`DATE_TRUNC('week', ${codingLogs.solvedAt})`)
    .orderBy(sql`DATE_TRUNC('week', ${codingLogs.solvedAt})`)

    return rows;
    
}