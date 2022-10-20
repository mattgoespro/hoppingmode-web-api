import { RepositoryDetails, RepositoryLanguages, RepositorySummary } from "@mattgoespro/hoppingmode-web";
import axios, { AxiosStatic } from "axios";
import { gql, GraphQLClient } from "graphql-request";
import { Response } from "graphql-request/dist/types";
import { ApiClientDetails } from "./api-controller.service";
import { GitHubLanguageComposition, GitHubRepository, GitHubRepositoryDetails, GitHubRepositoryList } from "./github.model";
import { cascadeRounding } from "./util";

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

  public async getRepositorySummaries(): Promise<RepositorySummary[]> {
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

    return pinnedRepos.concat(unpinnedRepos);
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

  public async getRepository(repoName: string): Promise<RepositoryDetails> {
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
      name: repository.name,
      createdTimestamp: repository.createdAt,
      updatedTimestamp: repository.updatedAt,
      portfolioSpec: JSON.parse(repository.portfolioSpec.spec),
      readmeDoc: Buffer.from(repository.readmeDoc.content).toString("base64"),
    };
  }

  private calcLanguagePercentage(languages: RepositoryLanguages) {
    const totalBytes = Object.values(languages).reduce((val, s) => val + s, 0);
    const rawPercentages = Object.values(languages).map((numBytes) => (numBytes / totalBytes) * 100);
    const roundedPercentages = cascadeRounding(rawPercentages);

    const languagePercentages: RepositoryLanguages = {};
    let index = 0;

    for (const lang in languages) {
      // Percentage contribution is insignificant, ignore
      if (roundedPercentages[index] === 0) {
        continue;
      }

      languagePercentages[lang] = roundedPercentages[index];
      ++index;
    }

    return languagePercentages;
  }

  public async getLanguages(repoName: string): Promise<RepositoryLanguages> {
    const resp = await this.httpClient.get<GitHubLanguageComposition>(`/repos/mattgoespro/${repoName}/languages`);
    return this.calcLanguagePercentage(resp.data);
  }
}
