import { gql } from "graphql-request";
import { GithubGraphQlPinnedRepositories, createGithubRepoResponse, GithubRepository, GithubApiRestError } from "../app.model";
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

  restServer.get("/repos", async (request, respond) => {
    httpClient
      .get<GithubRepository[]>(`/users/mattgoespro/repos`)
      .then((resp) => {
        const githubRepos = resp.data;
        gqlClient
          .request<GithubGraphQlPinnedRepositories>(
            gql`
              {
                user(login: "mattgoespro") {
                  pinnedItems(first: ${request.query.first || 10}, types: REPOSITORY) {
                    nodes {
                      ... on Repository {
                        name
                      }
                    }
                  }
                }
              }
            `
          )
          .then((resp) => {
            const pinnedGithubRepos = resp;

            // Strip extraneous fields from Github API response body.
            const repoData = githubRepos.map((repo) => ({
              full_name: repo.full_name,
              name: repo.name,
              description: repo.description,
              pinned: false,
              created_at: repo.created_at,
              updated_at: repo.updated_at,
              html_url: repo.html_url,
            }));

            respond.status(200).json(createGithubRepoResponse(repoData, pinnedGithubRepos));
          })
          .catch(() => {
            respond.status(500).json("GraphQL request error.");
          });
      })
      .catch((err: GithubApiRestError) => {
        respond.status(err.response.status).json(err.response.statusText);
      });
  });

  restServer.get("/repos/:repoName/languages", (request, respond) => {
    httpClient
      .get<{ [key: string]: number }>(`/repos/mattgoespro/${request.params.repoName}/languages`)
      .then((resp) => {
        respond.status(200).json(resp.data);
      })
      .catch((err: GithubApiRestError) => {
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
      .catch((err: GithubApiRestError) => {
        respond.status(err.response.status).json(err.response.statusText);
      });
  });

  return restServer;
};
