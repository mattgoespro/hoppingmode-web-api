import { githubUsername, githubGraphqlServerUrl, githubRestServerUrl } from "./environment";
import dotenv from "dotenv";
import generateBanner from "figlet";
import { RestApiServer } from "./src/services/api-controller.service";

// Inject environment variables
delete process.env.GITHUB_AUTH_TOKEN;

const envVariables = dotenv.config();

if (envVariables.error) {
  throw new Error("Environment file not found.");
}

const githubAuthToken = envVariables.parsed.GITHUB_AUTH_TOKEN;
const githubTokenCheck = /^ghp_[A-Za-z0-9]{36}$/;

if (githubAuthToken == null || !githubTokenCheck.test(githubAuthToken)) {
  console.log("Invalid authorization token.");
}

RestApiServer({
  restServerUrl: githubRestServerUrl,
  gqlServerUrl: githubGraphqlServerUrl,
  username: githubUsername,
  authToken: githubAuthToken,
}).listen(3000, () => {
  console.log(
    generateBanner.textSync("Server    started   ...", {
      font: "Standard",
      whitespaceBreak: true,
    })
  );
});
