export interface GithubRepositoryResponseDTO {
  name: string;
  full_name: string;
  description: string;
  created_at: string;
  updated_at: string;
  html_url: string;
  pinned: boolean;
}

export interface GithubRepositoryLanguageResponseDTO {
  languages: { [key: string]: number };
}

export interface GithubGqlResponseDTO {
  mattgoespro: {
    projects: {
      pinned: ApiRepositoryResponseDTO[];
    };
  };
}

export interface ApiRepositoryResponseDTO {
  name: string;
  description: string;
  createdTimestamp: string;
  updatedTimestamp: string;
  link: string;
}

export interface HttpErrorResponse {
  status: number;
  message: string;
}

export interface GithubApiRestErrorResponse {
  response: {
    status: number;
    statusText: string;
  };
}
