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

export type LanguageComposition = { [key: string]: number };

export function mapLanguageCompositionToPercentage(languageComposition: LanguageComposition) {
  const totalValues = Object.values(languageComposition).reduce((val, s) => val + s, 0);
  let totalPercentage = 0;
  const languagePercentages: LanguageComposition = {};

  for (const language in languageComposition) {
    const percentage = Math.floor((languageComposition[language] / totalValues) * 100);

    // Language contribution is so little, ignore it.
    if (percentage === 0) {
      continue;
    }

    languagePercentages[language] = percentage;
    totalPercentage += percentage;
  }

  if (totalPercentage < 100) {
    languagePercentages[Object.keys(languageComposition)[0]] += 100 - totalPercentage;
  }

  return languagePercentages;
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
