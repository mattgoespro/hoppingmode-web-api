import generateBanner from "figlet";
import server from "./src/server";

/**
 * Get GitHub API auth token from .env.
 */
function validateGitHubAuthToken() {
  const authToken = process.env.PROXY_GITHUB_AUTH_TOKEN;

  if (authToken == null) {
    throw new Error("Missing GitHub API authorization token.");
  }
  const validateTokenFormat = /^ghp_[A-Za-z0-9]{36}$/;

  if (authToken == null || !validateTokenFormat.test(authToken)) {
    throw new Error("The provided GitHub API authorization token format is invalid.");
  }
}

validateGitHubAuthToken();

server.listen(process.env.PORT || 8080, () =>
  console.log(
    generateBanner.textSync("Server    started   ...", {
      font: "Standard",
      whitespaceBreak: true
    })
  )
);
