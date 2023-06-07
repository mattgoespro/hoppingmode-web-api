export interface GitHubRepositoryDTO {
  name: string;
  description: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  topics: {
    list: {
      topicItem: {
        name: string;
      };
    }[];
  };
  owner?: {
    login: string;
  };
}

export interface ListGitHubRepositoriesDTO {
  payload: {
    pinned: {
      list: GitHubRepositoryDTO[];
    };
    all: {
      list: GitHubRepositoryDTO[];
    };
  };
}

export interface GitHubRepositoryViewDTO {
  payload: {
    repository: {
      readme: {
        content: string;
      };
      commit: {
        history: {
          totalCount: number;
        };
      };
      name: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

/**
 * GitHub API response for a repository's languages.
 *
 * Returns a map of language names to the number of bytes of code written in that language.
 */
export type GitHubRepositoryCodeLanguageDTO = { [key: string]: number };

export interface GitHubGraphqlErrorDTO {
  type: string;
}
