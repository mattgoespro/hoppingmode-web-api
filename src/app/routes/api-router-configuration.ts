import Express from "express";
import { apiRoutes, getProject, getProjectCodeLanguages, listProjects } from "./project-routes";

const apiRouter = Express.Router();

/**
 * List all projects
 */
apiRouter.get(apiRoutes.listProjects, listProjects);

/**
 * Get a project by name
 */
apiRouter.get(apiRoutes.getProject, getProject);

/**
 * List languages of project source code and their contribution in bytes
 */
apiRouter.get(apiRoutes.getProjectCodeLanguages, getProjectCodeLanguages);

export default apiRouter;
