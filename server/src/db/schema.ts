import { pgTable, uuid, varchar, text, integer, real, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const platformEnum = pgEnum("platform", ["LeetCode", "GFG", "Codeforces"]);
export const difficultyEnum = pgEnum("difficulty", ["Easy", "Medium", "Hard"]);
export const categoryEnum = pgEnum("category", ["Frontend", "Backend", "FullStack"]);
export const periodEnum = pgEnum("period", ["weekly", "monthly"]);
export const experienceEnum = pgEnum("experience_level", ["Beginner", "Intermediate", "Advanced"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  refreshToken: text("refresh_token"),
  targetedRole: varchar("targeted_role", { length: 100 }).default("SDE-1"),
  experienceLevel: experienceEnum("experience_level").default("Beginner"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const codingLogs = pgTable("coding_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  platform: platformEnum("platform").notNull(),
  problemName: varchar("problem_name", { length: 255 }).notNull(),
  problemLink: varchar("problem_link", { length: 500 }),
  difficulty: difficultyEnum("difficulty").notNull(),
  topic: varchar("topic", { length: 100 }).notNull(),
  description: text("description"),
  timeSpentMinutes: integer("time_spent_minutes").notNull(),
  attempts: integer("attempts").notNull().default(1),
  solvedAt: timestamp("solved_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projectLogs = pgTable("project_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  projectName: varchar("project_name", { length: 255 }).notNull(),
  category: categoryEnum("category").notNull(),
  techStack: text("tech_stack").array(),
  description: text("description"),
  hoursLogged: real("hours_logged").notNull(),
  loggedAt: timestamp("logged_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insightHistory = pgTable("insight_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  period: periodEnum("period").notNull(),
  summaryData: text("summary_data"),  // JSON stringified
  aiInsight: text("ai_insight"),
  generatedAt: timestamp("generated_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type CodingLog = typeof codingLogs.$inferSelect;
export type NewCodingLog = typeof codingLogs.$inferInsert;

export type ProjectLog = typeof projectLogs.$inferSelect;
export type NewProjectLog = typeof projectLogs.$inferInsert;

export type InsightHistory = typeof insightHistory.$inferSelect;
export type NewInsightHistory = typeof insightHistory.$inferInsert;