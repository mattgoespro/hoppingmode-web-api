import { gql, GraphQLClient } from "graphql-request";
import { GithubGqlResponse } from "../controllers/github-api.model";
import { ApiClientDetails } from "../controllers/rest-controller.service";

export class GithubGraphQlClient {
  private gqlClient: GraphQLClient;

  constructor(apiInfo: ApiClientDetails) {
    this.gqlClient = new GraphQLClient(apiInfo.githubGraphqlApiTarget, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${apiInfo.githubApiPat}`,
      },
    });
  }

  public async getPinnedRepositories(): Promise<GithubGqlResponse> {
    return this.gqlClient.request<GithubGqlResponse>(
      gql`
        query GithubPinnedProjects {
          response: user(login: "mattgoespro") {
            projects: pinnedItems(first: 6, types: REPOSITORY) {
              pinned: nodes {
                ... on Repository {
                  name
                  description
                  created_at: createdAt
                  updated_at: updatedAt
                  html_url: url
                }
              }
            }
          }
        }
      `
    );
  }
}
