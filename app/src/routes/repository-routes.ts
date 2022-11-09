import { GitHubApiClient } from "../services/github-api-client";
import { Request, Response } from "express";
import { respondWithHttpErrorStatus } from "../util";

const githubHttpClient = new GitHubApiClient();

/**
 * Available API Paths
 */
const paths = {
  list: "/repos",
  get: "/repos/:repoName",
  getProgrammingLanguages: "/:repoName/languages",
};

/**
 *
 * GitHub API request functions.
 *
 */

/**
 * List Repositories
 */
async function list(_request: Request, response: Response) {
  githubHttpClient
    .getRepositorySummaries()
    .then((resp) => {
      console.log(resp);
      response.status(200).json(resp);
    })
    .catch((err) => respondWithHttpErrorStatus(response, err));
}

/**
 * Get Repository by Name
 */
async function get(request: Request, response: Response) {
  githubHttpClient
    .getRepository(request.params.repoName)
    .then((resp) => {
      response.status(200).json(resp);
    })
    .catch((err) => respondWithHttpErrorStatus(response, err));
}

/**
 * Get Repository Programming Languages
 */
async function getProgrammingLanguages(request: Request, response: Response) {
  githubHttpClient
    .getLanguages(request.params.repoName)
    .then((resp) => response.status(200).json(resp))
    .catch((err) => respondWithHttpErrorStatus(response, err));
}

export default {
  paths,
  list,
  get,
  getProgrammingLanguages,
};
