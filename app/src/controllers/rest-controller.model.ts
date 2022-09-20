import { Response } from "express";
import { GithubRestErrorResponse, GithubRestRepositoryResponseDTO } from "./github-api.model";

export interface ApiRepositoryResponseDTO {
  repositoryName: string;
  friendlyName: string;
  description: string;
  createdTimestamp: string;
  updatedTimestamp: string;
  link: string;
}

export interface ApiHttpErrorResponse {
  httpErrorCode: number;
  message: string;
}

export function mapToApiRepositoryResponseDTO(githubResponseDTO: GithubRestRepositoryResponseDTO): ApiRepositoryResponseDTO {
  return {
    repositoryName: githubResponseDTO.name,
    friendlyName: githubResponseDTO.homepage, // Use homepage repo property to store display name
    description: githubResponseDTO.description,
    createdTimestamp: githubResponseDTO.created_at,
    updatedTimestamp: githubResponseDTO.updated_at,
    link: githubResponseDTO.html_url,
  };
}

export function sendApiErrorResponse(githubApiError: GithubRestErrorResponse, message: string, respond: Response, statusCode?: number) {
  console.log(githubApiError);
  const httpErrorCode: number = statusCode || githubApiError.response?.status || 520;
  const apiErrorResponse: ApiHttpErrorResponse = { httpErrorCode, message };
  return respond.status(httpErrorCode).json(apiErrorResponse);
}
