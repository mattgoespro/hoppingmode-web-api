import { githubApiLogin, githubGraphqlApiTarget, githubRestApiTarget } from "./environment";
import dotenv from "dotenv";
import generateBanner from "figlet";
import { RestApiServer } from "./src/controllers/rest-controller.service";

// Process .env file
delete process.env.GITHUB_API_PAT;
dotenv.config();

const githubApiPat = process.env.GITHUB_API_PAT as unknown as string;

if (githubApiPat == null) {
  console.log("WARN: Requests will be sent without authorization.");
}

RestApiServer({
  githubRestApiTarget,
  githubGraphqlApiTarget,
  githubApiLogin,
  githubApiPat,
}).listen(3000, () => {
  console.log(
    generateBanner.textSync("Server    started   ...", {
      font: "Standard",
      whitespaceBreak: true,
    })
  );
});
