import dotenv from "dotenv";

(() => {
  /**
   * Get GitHub API auth token from .env.
   */
  function validateGitHubAuthToken() {
    const authToken = environment.parsed.GITHUB_AUTH_TOKEN;
    const validateTokenFormat = /^ghp_[A-Za-z0-9]{36}$/;

    if (authToken == null || !validateTokenFormat.test(authToken)) {
      throw new Error("The provided authorization token format is invalid.");
    }
  }

  /**
   * Refresh and inject process environment
   */

  Object.keys(process.env).forEach((variable) => {
    if (variable.startsWith("GITHUB_")) {
      delete process.env[variable];
    }
  });

  const environment = dotenv.config();

  if (environment.error) {
    throw new Error("Environment file '.env' not found.");
  }

  validateGitHubAuthToken();
})();
