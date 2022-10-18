import { ApiResponse, RepositoryDetails, RepositoryLanguages, RepositorySummary } from "@mattgoespro/hoppingmode-web";
import axios, { AxiosStatic } from "axios";
import { gql, GraphQLClient } from "graphql-request";
import { ApiClientDetails } from "../controllers/rest-controller.service";
import { GitHubLanguageComposition, GitHubRepository, GitHubRepositoryDetails, GitHubRepositoryList } from "./github.model";

const HttpClient = (details: ApiClientDetails) => {
  axios.defaults.headers.common["Authorization"] = `token ${details.githubApiPat}`;
  axios.defaults.baseURL = details.githubRestApiTarget;
  axios.defaults.timeout = 2000;
  return axios;
};

export class ApiHttpClient {
  private gqlClient: GraphQLClient;
  private httpClient: AxiosStatic;

  constructor(apiInfo: ApiClientDetails) {
    this.gqlClient = new GraphQLClient(apiInfo.githubGraphqlApiTarget, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${apiInfo.githubApiPat}`,
      },
    });
    this.httpClient = HttpClient(apiInfo);
  }

  public async getRepositorySummaries(): Promise<ApiResponse<RepositorySummary[]>> {
    const isPortfolioRepo = (repo: GitHubRepository) => repo.repo_topics.topics.findIndex((t) => t.topic.name === "portfolio") !== -1;
    const mapToRepoSummary = (repo: GitHubRepository, pinned: boolean): RepositorySummary => ({
      name: repo.name,
      description: repo.description,
      pinned,
      githubUrl: repo.url,
    });
    const githubRepos = await this.queryGitHubRepositories();
    const pinnedRepos = githubRepos.payload.pinnedRepositories.pinned
      .filter(isPortfolioRepo)
      .map<RepositorySummary>((repo) => mapToRepoSummary(repo, true));
    const unpinnedRepos = githubRepos.payload.repositories.all
      .filter(isPortfolioRepo)
      .filter((repo) => pinnedRepos.findIndex((r) => r.name === repo.name) === -1)
      .map<RepositorySummary>((repo) => mapToRepoSummary(repo, false));

    return {
      payload: pinnedRepos.concat(unpinnedRepos),
    };
  }

  private async queryGitHubRepositories(): Promise<GitHubRepositoryList> {
    const topicsQuery = gql`
      repo_topics: repositoryTopics(first: 1) {
        topics: nodes {
          ... on RepositoryTopic {
            topic {
              name
            }
          }
        }
      }
    `;

    return this.gqlClient.request<GitHubRepositoryList>(
      gql`
        query GitHubRepositories {
          payload: user(login: "mattgoespro") {
            repositories(first: 20, ownerAffiliations: OWNER, privacy: PUBLIC) {
              all: nodes {
                ... on Repository {
                  name
                  description
                  url
                  createdAt
                  updatedAt
                  ${topicsQuery}
                }
              }
            }
            pinnedRepositories: pinnedItems(first: 6, types: REPOSITORY) {
              pinned: nodes {
                ... on Repository {
                  name
                  description
                  url
                  createdAt
                  updatedAt
                  ${topicsQuery}
                }
              }
            }
          }
        }
      `
    );
  }

  public async getRepository(repoName: string): Promise<ApiResponse<RepositoryDetails>> {
    const resp = await this.gqlClient.request<GitHubRepositoryDetails>(
      gql`
        query GitHubRepositoryPortfolio {
          payload: user(login: "mattgoespro") {
            repository(name: "${repoName}") {
              portfolioSpec: object(expression: "main:portfolio.json") {
                ... on Blob {
                  spec: text
                }
              }
              readmeDoc: object(expression: "main:README.md") {
                ... on Blob {
                  content: text
                }
              }
              ... on Repository {
                name
                createdAt
                updatedAt
              }
            }
          }
        }
      `
    );

    const repository = resp.payload.repository;

    return {
      payload: {
        name: repository.name,
        createdTimestamp: repository.createdAt,
        updatedTimestamp: repository.updatedAt,
        portfolioSpec: JSON.parse(repository.portfolioSpec.spec),
        readmeDoc: Buffer.from(repository.readmeDoc.content).toString("base64"),
      },
    };
  }

  public async getLanguages(repoName: string): Promise<ApiResponse<RepositoryLanguages[]>> {
    const resp = await this.httpClient.get<GitHubLanguageComposition>(`/repos/mattgoespro/${repoName}/languages`);

    const languages: RepositoryLanguages[] = [];

    for (const language in resp.data) {
      languages.push({
        language,
        bytes: resp.data[language],
      });
    }

    return {
      payload: languages,
    };
  }
}
