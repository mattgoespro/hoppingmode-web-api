import { ApiRepositoryResponseDTO } from "./rest-controller.model";

export interface GithubRestRepositoryResponseDTO {
  name: string;
  description: string;
  homepage: string;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface GithubRestFileResponseDTO {
  content: string;
  encoding: BufferEncoding;
}

export interface GithubGqlErrorResponse {
  response: {
    status: number;
    message: string;
  };
}

export interface GithubGqlResponseDTO {
  mattgoespro: {
    projects: {
      pinned: ApiRepositoryResponseDTO[];
    };
  };
}
