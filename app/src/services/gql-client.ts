import { gql, GraphQLClient } from "graphql-request";
import { GithubGqlResponseDTO } from "../controllers/github-api.model";
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

  public async getPinnedRepositories(): Promise<GithubGqlResponseDTO> {
    return this.gqlClient.request<GithubGqlResponseDTO>(
      gql`
        query GithubPinnedProjects {
          mattgoespro: user(login: "mattgoespro") {
            projects: pinnedItems(first: 6, types: REPOSITORY) {
              pinned: nodes {
                ... on Repository {
                  repositoryName: name
                  friendlyName: homepageUrl
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
    );
  }
}
