import { db } from "../../db";
import { projectLogs } from "../../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { CreateProjectLogInput, UpdateProjectLogInput } from "./projects.schema";

export const createProjectLog = async(userId: string, data: CreateProjectLogInput) =>{
    const [log] = await db
    .insert(projectLogs)
    .values({
        userId,
        ...data,
        loggedAt: new Date(data.loggedAt),
    })
    .returning();
    return log;
}

export const getProjectLogs = async(userId: string, page: number, limit: number)=>{
    const skip = (page-1)*limit;
    const logs = await db
    .select()
    .from(projectLogs)
    .where(eq(projectLogs.userId, userId))
    .orderBy(desc(projectLogs.loggedAt))
    .limit(limit)
    .offset(skip);

    const [{count}] = await db
    .select({ count: db.$count(projectLogs, eq(projectLogs.userId, userId))})
    .from(projectLogs);

    const total = Number(count);

    return { logs, total, page, pages: Math.ceil(total/limit)};
};

export const getProjectLogById = async(userId: string, id: string)=>{
    const [log] = await db
    .select()
    .from(projectLogs)
    .where(and(eq(projectLogs.id, id), eq(projectLogs.userId, userId)))
    .limit(1);

    return log ?? null;
};

export const updateProjectLog = async(userId: string, id: string, data: UpdateProjectLogInput)=>{
    const {loggedAt, ...restData} = data;
    const [updated] = await db
    .update(projectLogs)
    .set({
        ...restData,
        ...(loggedAt && {loggedAt: new Date(loggedAt)}),
    })
    .where(and(eq(projectLogs.userId, userId), eq(projectLogs.id, id)))
    .returning();

    return updated ?? null;
}

export const deleteProjectLog = async(userId: string, id: string)=>{
    const [deleted] = await db
    .delete(projectLogs)
    .where(and(eq(projectLogs.userId, userId), eq(projectLogs.id, id)))
    .returning();

    return deleted ?? null;
};