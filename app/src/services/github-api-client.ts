import {
  ProgrammingLanguages,
  ProjectSpecification,
  Repository,
  RepositorySummary
} from "@mattgoespro/hoppingmode-web";
import axios, { AxiosInstance } from "axios";
import { gql, GraphQLClient } from "graphql-request";
import {
  GitHubLanguageCompositionApiResponse,
  GitHubRepositoryApiResponse,
  GitHubRepositoryDetailsApiResponse,
  GitHubRepositoryListApiResponse
} from "../models/github-response";
import { cascadeRounding } from "../util";

export class GitHubApiClient {
  private githubGqlApi = "https://api.github.com/graphql";
  private githubApi = "https://api.github.com";
  private gql: GraphQLClient;
  private http: AxiosInstance;

  constructor() {
    const githubAuthToken = process.env.PROXY_GITHUB_AUTH_TOKEN;

    this.gql = new GraphQLClient(this.githubGqlApi, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${githubAuthToken}`
      }
    });

    this.http = axios.create({
      baseURL: this.githubApi,
      headers: { Authorization: `token ${githubAuthToken}` },
      timeout: 2000
    });
  }

  public async getRepositorySummaries(): Promise<RepositorySummary[]> {
    const isPortfolioRepo = (repo: GitHubRepositoryApiResponse) =>
      repo.repo_topics.topics.findIndex((t) => t.topic.name === "portfolio") !== -1;
    const mapToRepoSummary = (
      repo: GitHubRepositoryApiResponse,
      pinned: boolean
    ): RepositorySummary => ({
      name: repo.name,
      description: repo.description,
      pinned,
      githubUrl: repo.url
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

  private async queryGitHubRepositories(): Promise<GitHubRepositoryListApiResponse> {
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

    return this.gql.request<GitHubRepositoryListApiResponse>(
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
    // TODO: What if 'main' is not the primary branch (maybe 'master' is)?

    const resp = await this.gql.request<GitHubRepositoryDetailsApiResponse>(
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
    const specRaw = repository.projectSpec;
    let projectSpec: ProjectSpecification;

    if (specRaw != null) {
      projectSpec = JSON.parse(specRaw.spec);
    }

    return {
      name: repository.name,
      stats: {
        createdTimestamp: repository.createdAt,
        updatedTimestamp: repository.updatedAt,
        totalCommits: repository.commit.history.totalCount
      },
      projectSpec,
      readme: {
        content: Buffer.from(repository.readme.content).toString("base64"),
        encoding: "base64"
      }
    };
  }

  private calcLanguagePercentage(languages: ProgrammingLanguages) {
    const totalBytes = Object.values(languages).reduce((val, s) => val + s, 0);
    const rawPercentages = Object.values(languages).map(
      (numBytes) => (numBytes / totalBytes) * 100
    );
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
    const resp = await this.http.get<GitHubLanguageCompositionApiResponse>(
      `/repos/mattgoespro/${repoName}/languages`
    );
    return this.calcLanguagePercentage(resp.data);
  }
}
