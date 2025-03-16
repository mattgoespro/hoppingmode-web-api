import { textSync } from "figlet";
import server from "./server";

/**
 * Validate GitHub provided token.
 */
function validateGitHubToken() {
  const githubToken = process.env.GITHUB_API_TOKEN;

  if (githubToken == null) {
    throw new Error("Missing GitHub API authorization token.");
  }
  const validateTokenFormat = /^github_pat_[A-Za-z0-9_]+$/;

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

const environment = setup();
const port = environment.port;

server.listen(port, () => {
  const banner = textSync(["Started", "server"].join(" ".repeat(3)), {
    font: "Standard",
    horizontalLayout: "default",
    verticalLayout: "default",
    width: 80
  });
  console.log(banner);
  console.log(`\n[${new Date().toUTCString()}] Listening on port ${port}`);
});
