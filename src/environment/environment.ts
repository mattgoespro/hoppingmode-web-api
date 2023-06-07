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
    throw new Error("The provided GitHub API authorization token format is invalid.");
  }
}

/**
 * Setup the environment.
 */
function setup() {
  validateGitHubToken();

  let port = +process.env.PORT;

  if (port == null) {
    console.warn("Port not specified, defaulting to 8080");
    port = 8080;
  }

  if (Number.isNaN(port)) {
    throw new Error("Invalid port");
  }

  return {
    port
  };
}

export { setup };
