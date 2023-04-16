import { Router } from "express";
import repositoryRoutes from "./repository-routes";

const apiRouter = Router();

// List repositories
apiRouter.get(repositoryRoutes.paths.list, repositoryRoutes.list);

// Get repository
apiRouter.get(repositoryRoutes.paths.get, repositoryRoutes.get);

// Get repository programming languages
apiRouter.get(
  repositoryRoutes.paths.getProgrammingLanguages,
  repositoryRoutes.getProgrammingLanguages
);

export default apiRouter;
