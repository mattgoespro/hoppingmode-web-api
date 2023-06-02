import { ParameterizedRequest } from "../models/parameterized-request";
import { GitHubApiClient } from "../services/github-api-client.service";
import { respondWithErrorStatus } from "../util";
import Express from "express";

const githubHttpClient = new GitHubApiClient();

interface ApiRoutes {
  [key: string]: ListProjectsRequest | GetProjectRequest | GetProjectCodeLanguagesRequest;
}

/**
 * Available API Paths
 */
type ListProjectsRequest = "/projects";
type GetProjectRequest = "/projects/:name";
type GetProjectCodeLanguagesRequest = "/projects/:name/code-languages";

export const apiRoutes: ApiRoutes = {
  listProjects: "/projects",
  getProject: "/projects/:name",
  getProjectCodeLanguages: "/projects/:name/code-languages"
};

/**
 *
 * GitHub API request functions.
 *
 */

export async function listProjects(
  _request: ParameterizedRequest<ListProjectsRequest>,
  response: Express.Response
) {
  githubHttpClient
    .constructProjectListDTOs()
    .then((resp) => {
      response.status(200).json(resp);
    })
    .catch((err) => respondWithErrorStatus(response, err));
}

export async function getProject(
  request: ParameterizedRequest<GetProjectRequest>,
  response: Express.Response
) {
  githubHttpClient
    .constructProjectViewDTO(request.params.name)
    .then((resp) => {
      response.status(200).json(resp);
    })
    .catch((err) => respondWithErrorStatus(response, err));
}

export async function getProjectCodeLanguages(
  request: ParameterizedRequest<GetProjectCodeLanguagesRequest>,
  response: Express.Response
) {
  githubHttpClient
    .constructProjectCodingLanguagesDTO(request.params.name)
    .then((resp) => response.status(200).json(resp))
    .catch((err) => respondWithErrorStatus(response, err));
}
