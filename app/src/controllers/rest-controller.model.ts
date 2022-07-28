import { Response } from "express";
import { ApiHttpErrorResponse, ApiRepositoryResponseDTO } from "../app.model";

export interface GithubRepositoryResponseDTO {
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface GithubGqlResponseDTO {
  mattgoespro: {
    projects: {
      pinned: ApiRepositoryResponseDTO[];
    };
  };
}

export interface GithubApiErrorResponse {
  response: {
    status: number;
  };
}

export function sendApiErrorResponse(githubApiError: GithubApiErrorResponse, message: string, respond: Response, statusCode?: number) {
  const httpErrorCode: number = statusCode || githubApiError.response.status;
  const apiErrorResponse: ApiHttpErrorResponse = { httpErrorCode, message };
  return respond.status(httpErrorCode).json(apiErrorResponse);
}
