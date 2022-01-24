import { gql } from "graphql-request";
import { env } from "./environment";

export interface PinnedRepositories {
  user: {
    pinnedItems: {
      nodes: { name: string }[];
    };
  };
}

export interface GithubProject {
  name: string;
  full_name: string;
  description: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export const pinnedGithubReposRequest = gql`
    {
      user(login: "${env.githubLogin}") {
        pinnedItems(first: 6, types: REPOSITORY) {
          nodes {
            ... on Repository {
              name
            }
          }
        }
      }
    }
  `;
