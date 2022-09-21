import { AxiosError } from "axios";
import { Response } from "express";
import { GithubRestRepositoryResponseDTO } from "./github-api.model";

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

export function sendErrorResponse(error: AxiosError, respond: Response) {
  if (error.response) {
    return respond.sendStatus(error.response.status);
  } else if (error.request) {
    return respond.sendStatus(503);
  }
}
