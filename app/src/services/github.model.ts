export interface GitHubRepository {
  name: string;
  description: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  repo_topics: {
    topics: {
      topic: {
        name: string;
      };
    }[];
  };
}

export interface GitHubRepositoryList {
  payload: {
    repositories: {
      all: GitHubRepository[];
    };
    pinnedRepositories: {
      pinned: GitHubRepository[];
    };
  };
}

export interface GitHubRepositoryDetails {
  payload: {
    repository: {
      portfolioSpec: {
        spec: string;
      };
      readmeDoc: {
        content: string;
      };
      name: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export type GitHubLanguageComposition = { [key: string]: number };