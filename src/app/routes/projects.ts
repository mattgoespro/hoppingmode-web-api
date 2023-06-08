import express from "express";
import { GitHubApiClient } from "../services/github.service";
import { ParameterizedRequest } from "../services/request";
import { ApiError } from "../services/server.model";

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
  response: express.Response
) {
  githubHttpClient
    .constructProjectListDTOs()
    .then((resp) => {
      response.status(200).json(resp);
    })
    .catch((err) => response.sendStatus(err.getApiError().status));
}

export async function getProject(
  request: ParameterizedRequest<GetProjectRequest>,
  response: express.Response
) {
  githubHttpClient
    .constructProjectViewDTO(request.params.name)
    .then((resp) => {
      response.status(200).json(resp);
    })
    .catch((err: ApiError) => response.sendStatus(err.getApiError().status));
}

export async function getProjectCodeLanguages(
  request: ParameterizedRequest<GetProjectCodeLanguagesRequest>,
  response: express.Response
) {
  githubHttpClient
    .constructProjectCodingLanguagesDTO(request.params.name)
    .then((resp) => response.status(200).json(resp))
    .catch((err: ApiError) => response.sendStatus(err.getApiError().status));
}
