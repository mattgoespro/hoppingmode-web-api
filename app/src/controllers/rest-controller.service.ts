import { GithubRestErrorResponse, GithubRestRepositoryResponseDTO } from "./github-api.model";
import { Buffer } from "buffer";
import { axiosHttpClient } from "../services/http-client";
import restServer from "../rest-server";
import { mapToApiRepositoryResponseDTO, sendApiErrorResponse } from "./rest-controller.model";
import { GithubGraphQlClient } from "../services/gql-client";

export interface ApiClientDetails {
  githubRestApiTarget: string;
  githubGraphqlApiTarget: string;
  githubApiLogin: string;
  githubApiPat: string;
}

export const RestApiServer = (apiDetails: ApiClientDetails) => {
  const httpClient = axiosHttpClient(apiDetails);
  const gqlClient = new GithubGraphQlClient(apiDetails);

  restServer.get("/", (_request, respond) => {
    respond.send("Hello, this is dog.");
  });

  async function doesGitHubRepositoryExist(repoName: string) {
    return httpClient.get<GithubRestRepositoryResponseDTO[]>(`/repos/mattgoespro/${repoName}`);
  }

  restServer.get("/repos", (_request, respond) => {
    httpClient
      .get<GithubRestRepositoryResponseDTO[]>(`/users/mattgoespro/repos`)
      .then((resp) => respond.status(200).json(resp.data.map(mapToApiRepositoryResponseDTO)))
      .catch((err: GithubRestErrorResponse) => {
        sendApiErrorResponse(err, "Unable to retrieve Github projects.", respond);
      });
  });

  restServer.get("/repos/pinned", (_request, respond) => {
    gqlClient
      .getPinnedRepositories()
      .then((resp) => {
        respond.status(200).send(resp.mattgoespro.projects.pinned);
      })
      .catch((err: GithubRestErrorResponse) => {
        sendApiErrorResponse(err, "Unable to retrieve pinned Github projects.", respond);
      });
  });

  restServer.get("/repos/:repoName/languages", async (request, respond) => {
    const repoName = request.params.repoName;

    doesGitHubRepositoryExist(repoName)
      .then(() =>
        httpClient
          .get<{ [key: string]: number }>(`/repos/mattgoespro/${repoName}/languages`)
          .then((resp) => {
            respond.status(200).json({
              languages: resp.data,
            });
          })
          .catch((err: GithubRestErrorResponse) => {
            sendApiErrorResponse(err, `Unable to retrieve languages for project '${repoName}'.`, respond);
          })
      )
      .catch(() => sendApiErrorResponse(null, `Project '${repoName}' does not exist.`, respond, 404));
  });

  restServer.get("/repos/:repoName/readme", async (request, respond) => {
    const repoName = request.params.repoName;

    doesGitHubRepositoryExist(repoName)
      .then(() =>
        httpClient
          .get<{ content: string; encoding: BufferEncoding }>(`/repos/mattgoespro/${repoName}/contents/README.md`)
          .then((rsp) => {
            const readme = Buffer.from(rsp.data.content, rsp.data.encoding).toString();
            respond.status(200).json({ content: readme });
          })
          .catch((err: GithubRestErrorResponse) => {
            respond.status(err.response.status).send(err.response);
          })
      )
      .catch(() => sendApiErrorResponse(null, `Project '${repoName}' does not exist.`, respond, 404));
  });

  return restServer;
};
