import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createProjectLogSchema, updateProjectLogSchema } from "./projects.schema";
import { createProject, getProjects, getProject, updateProject, deleteProject } from "./projects.controller";

const router = Router();

router.post("/", protect, validate(createProjectLogSchema), createProject);
router.get("/", protect, getProjects);
router.get("/:id", protect, getProject);
router.put("/:id", protect, validate(updateProjectLogSchema), updateProject);
router.delete("/:id", protect, deleteProject);

export default router;