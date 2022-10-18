import restServer from "../app";
import { ApiHttpClient } from "./api-http-client";
import { respondWithApiError } from "./util";

export interface ApiClientDetails {
  githubRestApiTarget: string;
  githubGraphqlApiTarget: string;
  githubApiLogin: string;
  githubApiPat: string;
}

export const RestApiServer = (apiDetails: ApiClientDetails) => {
  const apiClient = new ApiHttpClient(apiDetails);

  restServer.get("/", (_request, respond) => {
    respond.send("Hello, this is dog.");
  });

  restServer.get("/repos/:repoName", (request, respond) => {
    apiClient
      .getRepository(request.params.repoName)
      .then((resp) => {
        respond.status(200).json(resp);
      })
      .catch((err) => respondWithApiError(respond, err));
  });

  restServer.get("/repos", (_request, respond) => {
    apiClient
      .getRepositorySummaries()
      .then((resp) => respond.status(200).json(resp))
      .catch((err) => respondWithApiError(respond, err));
  });

  restServer.get("/repos/:repoName/languages", (request, respond) => {
    apiClient
      .getLanguages(request.params.repoName)
      .then((resp) => respond.status(200).json(resp))
      .catch((err) => respondWithApiError(respond, err));
  });

  return restServer;
};
