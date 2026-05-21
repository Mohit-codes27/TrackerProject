import { z } from "zod";

export const createProjectLogSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  category: z.enum(["Frontend", "Backend", "FullStack"]),
  techStack: z.array(z.string()).optional(),
  description: z.string().optional(),
  hoursLogged: z.number().min(0.5, "Minimum 0.5 hours"),
  loggedAt: z.string().datetime(),
});

export const updateProjectLogSchema = createProjectLogSchema.partial();

export type CreateProjectLogInput = z.infer<typeof createProjectLogSchema>;
export type UpdateProjectLogInput = z.infer<typeof updateProjectLogSchema>;