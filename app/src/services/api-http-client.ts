import { ProgrammingLanguages, ProjectSpecification, Repository, RepositorySummary } from "@mattgoespro/hoppingmode-web";
import axios, { AxiosStatic } from "axios";
import { gql, GraphQLClient } from "graphql-request";
import { GitHubApiConnectionInfo } from "../model/app.model";
import { GitHubLanguageComposition, GitHubRepository, GitHubRepositoryDetails, GitHubRepositoryList } from "../model/github.model";
import { cascadeRounding } from "./util";

const HttpClient = (connectionInfo: GitHubApiConnectionInfo) => {
  axios.defaults.headers.common["Authorization"] = `token ${connectionInfo.authToken}`;
  axios.defaults.baseURL = connectionInfo.restServerUrl;
  axios.defaults.timeout = 2000;
  return axios;
};

export class ApiHttpClient {
  private gqlClient: GraphQLClient;
  private httpClient: AxiosStatic;

  constructor(connectionInfo: GitHubApiConnectionInfo) {
    this.gqlClient = new GraphQLClient(connectionInfo.gqlServerUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${connectionInfo.authToken}`,
      },
    });
    this.httpClient = HttpClient(connectionInfo);
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
        {
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

  public async getRepository(repoName: string): Promise<Repository> {
    const resp = await this.gqlClient.request<GitHubRepositoryDetails>(
      gql`
        {
          payload: user(login: "mattgoespro") {
            repository(name: "${repoName}") {
              projectSpec: object(expression: "main:portfolio.json") {
                ... on Blob {
                  spec: text
                }
              }
              readme: object(expression: "main:README.md") {
                ... on Blob {
                  content: text
                }
              }
              commit: object(expression: "main") {
                ... on Commit {
                  history {
                    totalCount
                  }
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
    const spec: ProjectSpecification = JSON.parse(repository.projectSpec.spec);

    return {
      name: repository.name,
      stats: {
        createdTimestamp: repository.createdAt,
        updatedTimestamp: repository.updatedAt,
        totalCommits: repository.commit.history.totalCount,
      },
      projectSpec: {
        title: spec.title,
        technicalSkills: spec.technicalSkills,
      },
      readme: {
        content: Buffer.from(repository.readme.content).toString("base64"),
        encoding: "base64",
      },
    };
  }

  private calcLanguagePercentage(languages: ProgrammingLanguages) {
    const totalBytes = Object.values(languages).reduce((val, s) => val + s, 0);
    const rawPercentages = Object.values(languages).map((numBytes) => (numBytes / totalBytes) * 100);
    const roundedPercentages = cascadeRounding(rawPercentages);

    const languagePercentages: ProgrammingLanguages = {};
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

  public async getLanguages(repoName: string): Promise<ProgrammingLanguages> {
    const resp = await this.httpClient.get<GitHubLanguageComposition>(`/repos/mattgoespro/${repoName}/languages`);
    return this.calcLanguagePercentage(resp.data);
  }
}
