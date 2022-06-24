import { RestApiServer } from "./src/services/controllers/rest-controller";
import moment from "moment";
import dotenv from "dotenv";

// Process environment variables
delete process.env.GITHUB_API_PAT;
dotenv.config();

RestApiServer({
  githubRestApiTarget: "https://api.github.com",
  githubGraphqlApiTarget: "https://api.github.com/graphql",
  githubApiLogin: "mattgoespro",
  githubApiPat: process.env.GITHUB_API_PAT || "",
}).listen(3000, () => {
  console.log(`[${moment().format("llll")}][INFO] REST API server started.`);
  console.log(`[${moment().format("llll")}][INFO] Listening on port 3000...`);
});
