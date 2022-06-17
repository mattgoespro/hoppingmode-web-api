import { gql } from "graphql-request";
import { GithubGraphQlPinnedRepositories, createGithubRepoResponse, respondWithError as respondError, GithubRepository } from "../app.model";
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

  restServer.get("/repos", async (_request, respond) => {
    try {
      const githubRepos = await httpClient.get(`/users/mattgoespro/repos`);
      const pinnedGithubRepos = await gqlClient.request<GithubGraphQlPinnedRepositories>(
        gql`
          {
            user(login: "mattgoespro") {
              pinnedItems(first: 6, types: REPOSITORY) {
                nodes {
                  ... on Repository {
                    name
                  }
                }
              }
            }
          }
        `
      );

      // Strip extraneous fields from Github API response body.
      const repoData = (githubRepos.data as GithubRepository[]).map((data) => ({
        full_name: data.full_name,
        name: data.name,
        description: data.description,
        pinned: false,
        created_at: data.created_at,
        updated_at: data.updated_at,
        html_url: data.html_url,
      }));

      respond.status(200).json(createGithubRepoResponse(repoData, pinnedGithubRepos));
    } catch (err) {
      respondError(err, "Failed to retrieve repositories." + JSON.stringify(err), respond, 500);
    }
  });

  restServer.get("/repos/:name/languages", (request, respond) => {
    httpClient
      .get(`/repos/mattgoespro/${request.params.name}/languages`)
      .then((languages: { data: any }) => {
        respond.status(200).json(languages.data);
      })
      .catch((err: any) => {
        console.log(err);
        respondError(err, `Failed to retrieve languages for project '${request.params.name}'.`, respond);
      });
  });

  restServer.get("/repos/:name/readme", (request, respond) => {
    httpClient
      .get(`/repos/mattgoespro/${request.params.name}/contents/README.md`)
      .then((rsp: { data: { content: any }; status: number }) => {
        let payload = rsp.data.content;

        if (rsp.status === 404) {
          payload = "";
        } else if (rsp.status === 200 || rsp.status === 304) {
          payload = Buffer.from(payload, "base64").toString().trim();
        }

        respond.status(200).send(payload);
      })
      .catch((err: any) => {
        respondError(err, `Failed to retrieve readme for project '${request.params.name}'.`, respond);
      });
  });

  return restServer;
};
