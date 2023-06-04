import {
  ProjectCodingLanguagesDTO,
  ProjectViewDTO,
  ProjectListDTO,
  ProjectReadmeViewDTO
} from "@mattgoespro/hoppingmode-web-core";
import axios, { AxiosInstance } from "axios";
import { GraphQLClient } from "graphql-request";
import {
  GitHubRepositoryCodeLanguageDTO,
  GitHubRepositoryDTO,
  GitHubRepositoryViewDTO,
  ListGitHubRepositoriesDTO
} from "./github-api.dto";
import { roundCascading } from "../util";
import {
  GITHUB_LIST_REPOSITORIES_GQL,
  GITHUB_LOGIN,
  createViewRepositoryGqlRequest
} from "./github-api.model";
import { Encoding } from "crypto";

export class GitHubApiClient {
  private PORTFOLIO_TAG = "portfolio-project";
  private GITHUB_README_ENCODING: Encoding = "utf-8";
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
      headers: {
        Authorization: `token ${githubAuthToken}`
      },
      timeout: 2000
    });
  }

  private ownsPortfolioProject(repo: GitHubRepositoryDTO) {
    const login = repo.owner?.login;

    if (login != null && login !== GITHUB_LOGIN) {
      return false;
    }

    return repo.topics.list.findIndex((t) => t.topicItem.name === this.PORTFOLIO_TAG) !== -1;
  }

  private constructProjectListDTO(repo: GitHubRepositoryDTO, pinned: boolean): ProjectListDTO {
    return {
      name: repo.name,
      description: repo.description,
      pinned,
      githubUrl: repo.url
    };
  }

  public async constructProjectListDTOs(): Promise<ProjectListDTO[]> {
    try {
      const githubRepositoryList = (
        await this.gql.request<ListGitHubRepositoriesDTO>(GITHUB_LIST_REPOSITORIES_GQL)
      ).payload;

      const regularRepositories = githubRepositoryList.all.list
        .filter(this.ownsPortfolioProject.bind(this))
        .filter(
          (repo) =>
            githubRepositoryList.pinned.list.findIndex((repo2) => repo2.name === repo.name) === -1
        )
        .map((repo) => this.constructProjectListDTO(repo, false));

      const pinnedRepositories = githubRepositoryList.pinned.list
        .filter(this.ownsPortfolioProject.bind(this))
        .map((repo) => this.constructProjectListDTO(repo, true));

      return regularRepositories.concat(pinnedRepositories);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  public async constructProjectViewDTO(repoName: string): Promise<ProjectViewDTO> {
    try {
      const githubResponseData = (
        await this.gql.request<GitHubRepositoryViewDTO>(createViewRepositoryGqlRequest(repoName))
      ).payload;

      const repository = githubResponseData.repository;
      const githubReadme = repository?.readme;

      let projectReadme: ProjectReadmeViewDTO;

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
      console.error(err);
      throw err;
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
    const totalBytes = Object.values(codeLanguagesByteMap).reduce((val, s) => val + s, 0);
    const contributions = roundCascading(
      Object.values(codeLanguagesByteMap).map((numBytes) => (numBytes / totalBytes) * 100)
    );

    const codeLanguagePercentageMap: ProjectCodingLanguagesDTO = {};

    for (let i = 0; i < Object.keys(codeLanguagesByteMap).length; i++) {
      /**
       * If language byte contribution was rounded to 0, prevalence of language
       * in project is insignificant, so ignore.
       */
      if (contributions[i] === 0) {
        continue;
      }

      codeLanguagePercentageMap[Object.keys(codeLanguagesByteMap)[i]] = contributions[i];
    }

    return codeLanguagePercentageMap;
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

      if (githubResponseData == null) {
        return {};
      }

      return this.mapCodeLanguagesBytesToPercentage(githubResponseData);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
