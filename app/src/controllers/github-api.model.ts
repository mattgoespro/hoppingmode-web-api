export interface GithubApiRepositoryResponse {
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface GithubApiFileResponse {
  content: string;
  encoding: BufferEncoding;
}

export interface GithubGqlResponse {
  response: {
    projects: {
      pinned: GithubApiRepositoryResponse[];
    };
  };
}
