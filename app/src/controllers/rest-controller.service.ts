import { gql } from "graphql-request";
import { GithubApiErrorResponse, GithubGqlResponseDTO, GithubRepositoryResponseDTO, sendApiErrorResponse } from "./rest-controller.model";
import { Buffer } from "buffer";
import { graphqlClient } from "../services/gql-client";
import { axiosHttpClient } from "../services/http-client";
import restServer from "../rest-server";
import { ApiRepositoryResponseDTO, GithubRepositoryLanguageResponseDTO } from "../app.model";

export interface ApiClientDetails {
  githubRestApiTarget: string;
  githubGraphqlApiTarget: string;
  githubApiLogin: string;
  githubApiPat: string;
}

export const RestApiServer = (apiDetails: ApiClientDetails) => {
  const gqlClient = graphqlClient(apiDetails);
  const httpClient = axiosHttpClient(apiDetails);

  restServer.get("/", (_request, respond) => {
    respond.send("Hello, this is dog.");
  });

  async function doesGitHubRepositoryExist(repoName: string) {
    return httpClient.get<GithubRepositoryResponseDTO[]>(`/repos/mattgoespro/${repoName}`);
  }

  restServer.get("/repos", (_request, respond) => {
    httpClient
      .get<GithubRepositoryResponseDTO[]>(`/users/mattgoespro/repos`)
      .then((resp) => {
        // Strip extraneous fields from Github API response body.
        const repos = resp.data.map<ApiRepositoryResponseDTO>((repo) => ({
          name: repo.name,
          description: repo.description,
          createdTimestamp: repo.created_at,
          updatedTimestamp: repo.updated_at,
          link: repo.html_url,
        }));

        respond.status(200).json(repos);
      })
      .catch((err: GithubApiErrorResponse) => {
        sendApiErrorResponse(err, "Unable to retrieve Github projects.", respond);
      });
  });

  restServer.get("/repos/pinned", (_request, respond) => {
    gqlClient
      .request<GithubGqlResponseDTO>(
        gql`
          query GithubPinnedProjects {
            mattgoespro: user(login: "mattgoespro") {
              projects: pinnedItems(first: 5, types: REPOSITORY) {
                pinned: nodes {
                  ... on Repository {
                    name
                    description
                    createdTimestamp: createdAt
                    updatedTimestamp: updatedAt
                    link: url
                  }
                }
              }
            }
          }
        `
      )
      .then((resp) => {
        respond.status(200).send(resp.mattgoespro.projects.pinned);
      })
      .catch((err: GithubApiErrorResponse) => {
        sendApiErrorResponse(err, "Unable to retrieve pinned Github projects.", respond);
      });
  });

  restServer.get("/repos/:repoName/languages", async (request, respond) => {
    const repoName = request.params.repoName;

    doesGitHubRepositoryExist(repoName)
      .then(() =>
        httpClient
          .get<GithubRepositoryLanguageResponseDTO>(`/repos/mattgoespro/${repoName}/languages`)
          .then((resp) => {
            respond.status(200).json(resp.data);
          })
          .catch((err: GithubApiErrorResponse) => {
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
            respond.status(200).send(readme);
          })
          .catch((err: GithubApiErrorResponse) => {
            respond.status(err.response.status).send(err.response);
          })
      )
      .catch(() => sendApiErrorResponse(null, `Project '${repoName}' does not exist.`, respond, 404));
  });

  return restServer;
};
