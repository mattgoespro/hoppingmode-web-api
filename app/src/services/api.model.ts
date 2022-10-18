export interface ApiResponse<T> {
  payload: T;
}

export interface RepositorySummary {
  name: string;
  description: string;
  pinned: boolean;
  githubUrl: string;
}

export interface RepositoryDetails {
  name: string;
  createdTimestamp: string;
  updatedTimestamp: string;
  portfolioSpec: string;
  readmeDoc: string;
}

export interface RepositoryLanguages {
  language: string;
  bytes: number;
}
