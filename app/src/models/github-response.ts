export interface GitHubRepositoryApiResponse {
  name: string;
  description: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  repo_topics: {
    topics: {
      topic: {
        name: string
      }
    }[]
  };
}

export interface GitHubRepositoryListApiResponse {
  payload: {
    repositories: {
      all: GitHubRepositoryApiResponse[]
    },
    pinnedRepositories: {
      pinned: GitHubRepositoryApiResponse[]
    }
  };
}

export interface GitHubRepositoryDetailsApiResponse {
  payload: {
    repository: {
      projectSpec: {
        spec: string
      },
      readme: {
        content: string
      },
      commit: {
        history: {
          totalCount: number
        }
      },
      name: string,
      createdAt: string,
      updatedAt: string
    }
  };
}

export type GitHubLanguageCompositionApiResponse = { [key: string]: number };

export interface GitHubGraphqlErrorResponse {
  errors: GitHubGraphqlError[];
}

export interface GitHubGraphqlError {
  message: string;
  type?: string;
  path?: string[];
  extensions?: {
    code: string,
    typeName: string,
    fieldName: string
  };
  locations?: {
    line: number,
    column: number
  }[];
}
