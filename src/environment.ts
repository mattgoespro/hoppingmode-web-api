/**
 * Validate GitHub provided token.
 */
function validateGitHubToken() {
  const githubToken = process.env.API_GITHUB_TOKEN;

  if (githubToken == null) {
    throw new Error("Missing GitHub API authorization token.");
  }
  const validateTokenFormat = /^ghp_[A-Za-z0-9]{36}$/;

  if (githubToken == null || !validateTokenFormat.test(githubToken)) {
    throw new Error("Invalid GitHub API authorization token format.");
  }
}

/**
 * Setup the environment.
 */
export function setup() {
  validateGitHubToken();

  let port = Number.parseFloat(process.env.PORT);

  if (process.env.PORT == null) {
    console.warn("Using default port: 8080");
    port = 8080;
  }

  if (Number.isNaN(port)) {
    throw new Error("Invalid port: ${port}");
  }

  return {
    port
  };
}
