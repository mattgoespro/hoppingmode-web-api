import { gql } from "graphql-request";
import { env } from "./environment";

export interface GithubPinnedRepositories {
  user: {
    pinnedItems: {
      nodes: { name: string }[];
    };
  };
}

export interface GithubRepository {
  name: string;
  full_name: string;
  description: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export function pinnedGithubReposRequest(numItems: number) {
  return gql`
    {
      user(login: "${env.githubLogin}") {
        pinnedItems(first: ${numItems}, types: REPOSITORY) {
          nodes {
            ... on Repository {
              name
            }
          }
        }
      }
    }
  `;
}

export interface GithubRepositories {
  repositories: GithubRepository[];
  pinnedRepositories: GithubRepository[];
}

export function createGithubRepoResponse(
  repositories: GithubRepository[],
  pinnedRepositories: GithubPinnedRepositories
): GithubRepositories {
  return {
    repositories: repositories,
    pinnedRepositories: repositories.filter((repo) =>
      pinnedRepositories.user.pinnedItems.nodes
        .map((n) => n.name)
        .includes(repo.full_name)
    ),
  };
}
