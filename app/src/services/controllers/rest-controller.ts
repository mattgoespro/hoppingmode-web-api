import { gql } from "graphql-request";
import {
  GithubGqlResponseDTO,
  GithubRepositoryResponseDTO,
  GithubApiRestErrorResponse,
  ApiRepositoryResponseDTO,
  GithubRepositoryLanguageResponseDTO,
} from "../app.model";
import { Buffer } from "buffer";
import { graphqlClient } from "../clients/gql-client";
import { axiosHttpClient } from "../clients/http-client";
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
        respond.status(err.response.status).json(err.response.statusText);
      });
  });

  restServer.get("/repos/pinned", (_request, respond) => {
    gqlClient
      .request<GithubGqlResponseDTO>(
        gql`
          query GithubPinnedProjects {
            mattgoespro: user(login: "mattgoespro") {
              projects: pinnedItems(first: 4, types: REPOSITORY) {
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
        respond.status(200).json(resp.mattgoespro.projects.pinned);
      })
      .catch((err) => {
        respond.status(500).json("Malformed GraphQL request.");
      });
  });

  restServer.get("/repos/:repoName/languages", (request, respond) => {
    httpClient
      .get<GithubRepositoryLanguageResponseDTO>(`/repos/mattgoespro/${request.params.repoName}/languages`)
      .then((resp) => {
        respond.status(200).json(resp.data);
      })
      .catch((err: GithubApiRestErrorResponse) => {
        respond.status(err.response.status).json(err.response.statusText);
      });
  });

  restServer.get("/repos/:repoName/readme", (request, respond) => {
    httpClient
      .get<{ content: string; encoding: BufferEncoding }>(`/repos/mattgoespro/${request.params.repoName}/contents/README.md`)
      .then((rsp) => {
        const readme = Buffer.from(rsp.data.content, rsp.data.encoding).toString();
        respond.status(200).send(readme);
      })
      .catch((err: GithubApiRestErrorResponse) => {
        respond.status(err.response.status).json(err.response.statusText);
      });
  });

  return restServer;
};
