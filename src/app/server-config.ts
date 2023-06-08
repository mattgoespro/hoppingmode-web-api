import { Router } from "express";
import { apiRoutes, getProject, getProjectCodeLanguages, listProjects } from "./routes/projects";

const serverRouter = Router();

/**
 * List all projects
 */
serverRouter.get(apiRoutes.listProjects, listProjects);

/**
 * Get a project by name
 */
serverRouter.get(apiRoutes.getProject, getProject);

/**
 * List languages of project source code and their percentage contribution
 */
serverRouter.get(apiRoutes.getProjectCodeLanguages, getProjectCodeLanguages);

export default serverRouter;
