import {db} from "../../db";
import {codingLogs} from "../../db/schema";
import {eq, and, desc, ilike, SQL} from "drizzle-orm";
import {CreateCodingLogInput, UpdateCodingLogInput} from "./coding.schema";

export const createCodingLog = async(userId: string, data: CreateCodingLogInput) =>{
    const [log] = await db
    .insert(codingLogs)
    .values({
        userId,
        ...data,
        solvedAt: new Date(data.solvedAt),
    })
    .returning();

    return log;
};

export const getCodingLogs = async(userId: string, page: number, limit: number, filters:{ platform?: string; difficulty?: string})=>{
    const skip = (page-1)*limit;

    const conditions: SQL[] = [eq(codingLogs.userId, userId)];

    if(filters.platform && filters.platform !== "All"){
        conditions.push(eq(codingLogs.platform, filters.platform as any));
    }

    if(filters.difficulty && filters.difficulty !== "All"){
        conditions.push(eq(codingLogs.difficulty, filters.difficulty as any));
    }

    const whereClause = and(...conditions);

    const logs = await db
    .select()
    .from(codingLogs)
    .where(whereClause)
    .orderBy(desc(codingLogs.solvedAt))
    .limit(limit)
    .offset(skip);

    const [{count}] = await db
    .select({count: db.$count(codingLogs, whereClause)})
    .from(codingLogs);

    const total = Number(count);

    return { logs, total, page, pages: Math.ceil(total/limit)};
}

export const getCodingLogById = async(userId: string, id: string)=>{
    const [log] = await db
    .select()
    .from(codingLogs)
    .where(and(eq(codingLogs.id, id), eq(codingLogs.userId, userId)))
    .limit(1);

    return log??null;
}

export const updateCodingLog = async(userId: string, id: string, data: UpdateCodingLogInput)=>{
    const { solvedAt, ...restData } = data;
    const [updated] = await db
    .update(codingLogs)
    .set({
      ...restData,
      ...(solvedAt ? { solvedAt: new Date(solvedAt) } : {}),
    })
    .where(and(eq(codingLogs.id, id), eq(codingLogs.userId, userId)))
    .returning();
    return updated??null;
}

export const deleteCodingLog = async(userId: string, id: string)=>{
    const [deleted] = await db
    .delete(codingLogs)
    .where(and(eq(codingLogs.id, id), eq(codingLogs.userId, userId)))
    .returning();

    return deleted ?? null;
}