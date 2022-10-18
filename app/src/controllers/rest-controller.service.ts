import restServer from "../rest-server";
import { ApiHttpClient } from "../services/api-http-client";
import { Response } from "express";

export interface ApiClientDetails {
  githubRestApiTarget: string;
  githubGraphqlApiTarget: string;
  githubApiLogin: string;
  githubApiPat: string;
}

function respondWithError(respond: Response, err: any) {
  respond.sendStatus(500);
  console.log("ERROR");
  console.log(err);
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
        respond.status(200).json(resp.payload);
      })
      .catch((err) => respondWithError(respond, err));
  });

  restServer.get("/repos", async (_request, respond) => {
    apiClient
      .getRepositorySummaries()
      .then((resp) => respond.status(200).json(resp.payload))
      .catch((err) => respondWithError(respond, err));
  });

  restServer.get("/repos/:repoName/languages", async (request, respond) => {
    apiClient
      .getLanguages(request.params.repoName)
      .then((resp) => respond.status(200).json(resp.payload))
      .catch((err) => respondWithError(respond, err));
  });

  return restServer;
};
