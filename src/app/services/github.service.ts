import { Encoding } from "crypto";
import {
  ProjectCodingLanguagesDTO,
  ProjectViewDTO,
  ProjectSummaryDTO,
  ProjectReadmeViewDTO
} from "@mattgoespro/hw";
import axios, { AxiosInstance } from "axios";
import { GraphQLClient } from "graphql-request";
import { roundClone } from "@shared/utils";
import {
  GitHubRepositoryCodeLanguageDTO,
  GitHubRepositoryDTO,
  GitHubRepositoryViewDTO,
  ListGitHubRepositoriesDTO
} from "./github.dto";
import {
  GITHUB_LIST_REPOSITORIES_GQL,
  GITHUB_LOGIN,
  createViewRepositoryGqlRequest
} from "./github.model";
import { ApiError } from "./server.model";

export class GitHubApiClient {
  private PORTFOLIO_TAG = "portfolio-project";
  private GITHUB_README_ENCODING: Encoding = "utf-8";
  private githubGqlApi = "https://api.github.com/graphql";
  private githubApi = "https://api.github.com";
  private gql: GraphQLClient;
  private http: AxiosInstance;

  constructor() {
    const githubAuthToken = process.env.API_GITHUB_TOKEN;

    this.gql = new GraphQLClient(this.githubGqlApi, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${githubAuthToken}`
      }
    });

    this.http = axios.create({
      baseURL: this.githubApi,
      headers: {
        Authorization: `token ${githubAuthToken}`
      },
      timeout: 2000
    });
  }

  /**
   * Whether to list the repository as a portfolio project.
   *
   * Handles the case where the repository is pinned on my profile but
   * may be owned by a different user.
   */
  private listProject(repo: GitHubRepositoryDTO) {
    const login = repo.owner?.login;

    if (login != null && login !== GITHUB_LOGIN) {
      return false;
    }

    return repo.topics.list.findIndex((t) => t.topicItem.name === this.PORTFOLIO_TAG) !== -1;
  }

  private constructProjectListDTO(repo: GitHubRepositoryDTO, pinned: boolean): ProjectSummaryDTO {
    return {
      name: repo.name,
      description: repo.description,
      pinned: pinned,
      url: repo.url
    };
  }

  public async constructProjectListDTOs(): Promise<ProjectSummaryDTO[]> {
    try {
      const githubRepositoryList = (
        await this.gql.request<ListGitHubRepositoriesDTO>(GITHUB_LIST_REPOSITORIES_GQL)
      ).payload;

      const regularRepositories = githubRepositoryList.all.list
        .filter(this.listProject.bind(this))
        .filter(
          (repo) =>
            githubRepositoryList.pinned.list.findIndex((repo2) => repo2.name === repo.name) === -1
        )
        .map((repo) => this.constructProjectListDTO(repo, false));

      const pinnedRepositories = githubRepositoryList.pinned.list
        .filter(this.listProject.bind(this))
        .map((repo) => this.constructProjectListDTO(repo, true));

      return regularRepositories.concat(pinnedRepositories);
    } catch (err) {
      throw new ApiError(err);
    }
  }

  public async constructProjectViewDTO(repoName: string): Promise<ProjectViewDTO> {
    try {
      const githubResponseData = (
        await this.gql.request<GitHubRepositoryViewDTO>(createViewRepositoryGqlRequest(repoName))
      ).payload;

      const repository = githubResponseData.repository;
      const githubReadme = repository?.readme;

      let projectReadme: ProjectReadmeViewDTO = null;

      if (githubReadme != null) {
        projectReadme = {
          content: Buffer.from(githubReadme.content, this.GITHUB_README_ENCODING).toString("base64")
        };
      }

      return {
        name: repository.name,
        stats: {
          createdTimestamp: repository.createdAt,
          updatedTimestamp: repository.updatedAt,
          totalCommits: repository.commit?.history?.totalCount || 0
        },
        readme: projectReadme
      };
    } catch (err) {
      throw new ApiError(err);
    }
  }

  /**
   * Maps each coding language's size in bytes relative to the total project size into
   * a percentage.
   *
   * @param codeLanguagesByteMap map of the coding language name to its prevalent size in bytes
   * @returns map of the coding language name to its prevalent size as a percentage
   */
  private mapCodeLanguagesBytesToPercentage(
    codeLanguagesByteMap: ProjectCodingLanguagesDTO
  ): ProjectCodingLanguagesDTO {
    if (codeLanguagesByteMap == null) {
      return {};
    }

    const projectSizeBytes = Object.values(codeLanguagesByteMap).reduce((val, s) => val + s, 0);
    const percentContributions = roundClone(
      Object.values(codeLanguagesByteMap).map((numBytes) => (numBytes / projectSizeBytes) * 100)
    );

    const contributionMap: ProjectCodingLanguagesDTO = {};

    let i = 0;

    for (const language in codeLanguagesByteMap) {
      /**
       * If language byte contribution was rounded to 0, prevalence of language
       * in project is insignificant, so ignore.
       */
      if (percentContributions[i] === 0) {
        continue;
      }

      contributionMap[language] = percentContributions[i++];
    }

    return contributionMap;
  }

  public async constructProjectCodingLanguagesDTO(
    repoName: string
  ): Promise<ProjectCodingLanguagesDTO> {
    try {
      const githubResponseData = (
        await this.http.get<GitHubRepositoryCodeLanguageDTO>(
          `/repos/mattgoespro/${repoName}/languages`
        )
      ).data;

      return this.mapCodeLanguagesBytesToPercentage(githubResponseData);
    } catch (err) {
      throw new ApiError(err);
    }
  }
}
