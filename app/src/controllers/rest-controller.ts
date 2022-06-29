import { gql } from "graphql-request";
import {
  GithubGqlResponseDTO,
  GithubRepositoryResponseDTO,
  GithubApiRestErrorResponse,
  ApiRepositoryResponseDTO,
  GithubRepositoryLanguageResponseDTO,
  GraphQlErrorResponse,
} from "../app.model";
import { Buffer } from "buffer";
import { graphqlClient } from "../services/gql-client";
import { axiosHttpClient } from "../services/http-client";
import restServer from "../rest-server";

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
    const repos = await httpClient.get<GithubRepositoryResponseDTO[]>(`/users/mattgoespro/repos`);
    return repos.data.filter((repo) => repo.name === repoName).length > 0;
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
      .catch((err: GithubApiRestErrorResponse) => {
        respond.status(err.response.status).json(err.response);
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
      .catch((err: GraphQlErrorResponse) => {
        respond.status(err.response.status).send(err.response);
      });
  });

  restServer.get("/repos/:repoName/languages", async (request, respond) => {
    const repoName = request.params.repoName;

    if (await doesGitHubRepositoryExist(repoName)) {
      httpClient
        .get<GithubRepositoryLanguageResponseDTO>(`/repos/mattgoespro/${repoName}/languages`)
        .then((resp) => {
          respond.status(200).json(resp.data);
        })
        .catch((err: GithubApiRestErrorResponse) => {
          respond.status(err.response.status).send(err.response);
        });
    } else {
      respond.status(404).send({ status: 404, statusText: `Repository '${repoName}' does not exist.` });
    }
  });

  restServer.get("/repos/:repoName/readme", async (request, respond) => {
    const repoName = request.params.repoName;
    if (await doesGitHubRepositoryExist(repoName)) {
      httpClient
        .get<{ content: string; encoding: BufferEncoding }>(`/repos/mattgoespro/${repoName}/contents/README.md`)
        .then((rsp) => {
          const readme = Buffer.from(rsp.data.content, rsp.data.encoding).toString();
          respond.status(200).send(readme);
        })
        .catch((err: GithubApiRestErrorResponse) => {
          respond.status(err.response.status).send(err.response);
        });
    } else {
      respond.status(404).send({ status: 404, statusText: `Repository '${repoName}' does not exist.` });
    }
  });

  return restServer;
};
