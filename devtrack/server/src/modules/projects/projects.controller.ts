import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  createProjectLog,
  getProjectLogs,
  getProjectLogById,
  updateProjectLog,
  deleteProjectLog,
} from "./projects.service";

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const log = await createProjectLog(req.user!.id, req.body);
  res.status(201).json({ success: true, data: log });
});

export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const result = await getProjectLogs(req.user!.id, page, limit);
  res.status(200).json({ success: true, ...result });
});

export const getProject = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
  const log = await getProjectLogById(req.user!.id, id);
  if (!log) {
    res.status(404);
    throw new Error("Project log not found");
  }
  res.status(200).json({ success: true, data: log });
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
  const log = await updateProjectLog(req.user!.id, id, req.body);
  if (!log) {
    res.status(404);
    throw new Error("Project log not found");
  }
  res.status(200).json({ success: true, data: log });
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
  const log = await deleteProjectLog(req.user!.id, id);
  if (!log) {
    res.status(404);
    throw new Error("Project log not found");
  }
  res.status(200).json({ success: true, message: "Project log deleted successfully" });
});