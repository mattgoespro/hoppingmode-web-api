import { AxiosError } from "axios";
import { Response } from "express";
import { GithubApiRepositoryResponse } from "./github-api.model";

export interface ApiRepositoryResponse {
  name: string;
  pinned: boolean;
  description?: string;
  createdTimestamp: string;
  updatedTimestamp: string;
  link: string;
}

export interface ApiHttpErrorResponse {
  httpErrorCode: number;
  message: string;
}

export function mapGitHubToApi(githubResponseDTO: GithubApiRepositoryResponse, pinned: boolean): ApiRepositoryResponse {
  return {
    name: githubResponseDTO.name,
    pinned,
    description: githubResponseDTO.description,
    createdTimestamp: githubResponseDTO.created_at,
    updatedTimestamp: githubResponseDTO.updated_at,
    link: githubResponseDTO.html_url,
  };
}

export function sendErrorResponse(error: AxiosError, respond: Response) {
  if (error.response) {
    return respond.sendStatus(error.response.status);
  } else if (error.request) {
    return respond.sendStatus(503);
  }
}
