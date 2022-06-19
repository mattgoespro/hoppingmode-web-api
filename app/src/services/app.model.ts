export interface GithubGraphQlPinnedRepositories {
  user: {
    pinnedItems: {
      nodes: { name: string }[];
    };
  };
}

export interface GithubRepository {
  name: string;
  full_name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  html_url: string;
  pinned: boolean;
}

export function createGithubRepoResponse(repositories: GithubRepository[], pinnedRepositories: GithubGraphQlPinnedRepositories): GithubRepository[] {
  return repositories.map((repo) => ({
    ...repo,
    pinned: pinnedRepositories.user.pinnedItems.nodes.map((n) => n.name).includes(repo.name),
  }));
}

export interface ErrorResponse {
  status: number;
  message: string;
}

export interface GithubApiRestError {
  response: GithubApiRestErrorResponse;
}

interface GithubApiRestErrorResponse {
  status: number;
  statusText: string;
}
