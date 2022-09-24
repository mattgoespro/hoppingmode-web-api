import { GithubApiFileResponse, GithubApiRepositoryResponse } from "./github-api.model";
import { Buffer } from "buffer";
import { axiosHttpClient } from "../services/http-client";
import restServer from "../rest-server";
import {
  sendErrorResponse,
  mapGitHubToApi,
  ApiRepositoryResponse,
  LanguageComposition,
  mapLanguageCompositionToPercentage,
} from "./rest-controller.model";
import { GithubGraphQlClient } from "../services/gql-client";
import { AxiosError } from "axios";

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

  async function doesGithubRepositoryExist(repoName: string) {
    return httpClient.get<GithubApiRepositoryResponse[]>(`/repos/mattgoespro/${repoName}`);
  }

  restServer.get("/repos/:repoName", (request, respond) => {
    httpClient
      .get<GithubApiRepositoryResponse>(`/repos/mattgoespro/${request.params.repoName}`)
      .then((resp) => {
        respond.status(200).json(mapGitHubToApi(resp.data, null));
      })
      .catch((err) => sendErrorResponse(err, respond));
  });

  async function getPinnedRepositories(): Promise<ApiRepositoryResponse[]> {
    const gqlResponse = await gqlClient.getPinnedRepositories();
    return gqlResponse.response.projects.pinned.map((project) => mapGitHubToApi(project, true));
  }

  async function getUnpinnedRepositories(withoutPinned: ApiRepositoryResponse[]) {
    const apiResponse = (await httpClient.get<GithubApiRepositoryResponse[]>(`/users/mattgoespro/repos`)).data;
    return apiResponse
      .filter((project) => withoutPinned.findIndex((p) => p.name === project.name) === -1)
      .map((project) => mapGitHubToApi(project, false));
  }

  restServer.get("/repos", async (_request, respond) => {
    try {
      const pinnedRepos = await getPinnedRepositories();
      const unpinnedRepos = await getUnpinnedRepositories(pinnedRepos);
      respond.status(200).json(pinnedRepos.concat(unpinnedRepos));
    } catch (e) {
      sendErrorResponse(e, respond);
      return;
    }
  });

  restServer.get("/repos/:repoName/languages", async (request, respond) => {
    const repoName = request.params.repoName;

    doesGithubRepositoryExist(repoName)
      .then(() =>
        httpClient
          .get<LanguageComposition>(`/repos/mattgoespro/${repoName}/languages`)
          .then((resp) => respond.status(200).json(mapLanguageCompositionToPercentage(resp.data)))
          .catch((err) => sendErrorResponse(err, respond))
      )
      .catch((err) => sendErrorResponse(err, respond));
  });

  restServer.get("/repos/:repoName/readme", async (request, respond) => {
    const repoName = request.params.repoName;

    doesGithubRepositoryExist(repoName)
      .then(() => {
        httpClient
          .get<GithubApiFileResponse>(`/repos/mattgoespro/${repoName}/contents/README.md`)
          .then((rsp) => respond.status(200).json({ content: Buffer.from(rsp.data.content, rsp.data.encoding).toString() }))
          .catch((err) => {
            if (err.code === AxiosError.ERR_BAD_REQUEST) {
              // Repo has been created but cannot be queried.
              respond.status(200).json({ content: null });
            }
          });
      })
      .catch((err) => {
        sendErrorResponse(err, respond);
      });
  });

  restServer.get("/repos/:repoName/portfolio", async (request, respond) => {
    const repoName = request.params.repoName;

    doesGithubRepositoryExist(repoName)
      .then(() => {
        httpClient
          .get<GithubApiFileResponse>(`/repos/mattgoespro/${repoName}/contents/portfolio.json`)
          .then((rsp) => respond.status(200).json(JSON.parse(Buffer.from(rsp.data.content, rsp.data.encoding).toString())))
          .catch((err) => {
            sendErrorResponse(err, respond);
          });
      })
      .catch((err) => {
        sendErrorResponse(err, respond);
      });
  });

  return restServer;
};
