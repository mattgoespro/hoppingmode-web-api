import restServer from "../app";
import { GitHubApiConnectionInfo } from "../model/app.model";
import { ApiHttpClient } from "./api-http-client";
import { respondWithHttpErrorStatus } from "./util";

export const RestApiServer = (connectionInfo: GitHubApiConnectionInfo) => {
  const apiClient = new ApiHttpClient(connectionInfo);

  restServer.get("/", (_request, respond) => {
    respond.send("Hello, this is dog.");
  });

  restServer.get("/repos/:repoName", (request, respond) => {
    apiClient
      .getRepository(request.params.repoName)
      .then((resp) => {
        respond.status(200).json(resp);
      })
      .catch((err) => respondWithHttpErrorStatus(respond, err));
  });

  restServer.get("/repos", (_request, respond) => {
    apiClient
      .getRepositorySummaries()
      .then((resp) => respond.status(200).json(resp))
      .catch((err) => respondWithHttpErrorStatus(respond, err));
  });

  restServer.get("/repos/:repoName/languages", (request, respond) => {
    apiClient
      .getLanguages(request.params.repoName)
      .then((resp) => respond.status(200).json(resp))
      .catch((err) => respondWithHttpErrorStatus(respond, err));
  });

  return restServer;
};
