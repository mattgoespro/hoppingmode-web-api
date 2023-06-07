import generateBanner from "figlet";
import server from "./app/server";
import chalk from "chalk";

/**
 * Get GitHub API auth token from .env.
 */
function validateGitHubAuthToken() {
  const authToken = process.env.API_GITHUB_TOKEN;

  if (authToken == null) {
    throw new Error("Missing GitHub API authorization token.");
  }
  const validateTokenFormat = /^ghp_[A-Za-z0-9]{36}$/;

  if (authToken == null || !validateTokenFormat.test(authToken)) {
    throw new Error("The provided GitHub API authorization token format is invalid.");
  }
}

validateGitHubAuthToken();

const port = process.env.PORT || 8080;

server.listen(port, () => {
  const banner = generateBanner.textSync(["Started", "server"].join(" ".repeat(3)), {
    font: "Standard",
    horizontalLayout: "default",
    verticalLayout: "default",
    width: 80
  });
  console.log(banner);
  console.log("-".repeat(banner.length / 6));
  console.log();
  console.log(`${chalk.gray(`[${new Date().toUTCString()}]`)} Listening on port ${port}`);
});
