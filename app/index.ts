import { RestApiServer } from "./src/services/controllers/rest-controller";
import moment from "moment";
import dotenv from "dotenv";

// Process environment variables
delete process.env.GITHUB_API_PAT;
delete process.env.JWT_SIGNING_KEY;
dotenv.config();

RestApiServer({
  githubRestApiTarget: process.env.GITHUB_REST_API_TARGET,
  githubGraphqlApiTarget: process.env.GITHUB_GRAPHQL_API_TARGET,
  githubApiLogin: process.env.GITHUB_API_LOGIN,
  githubApiPat: process.env.GITHUB_API_PAT,
  jwtSigningKey: process.env.JWT_SIGNING_KEY,
}).listen(3000, () => {
  console.log(`[${moment().format("llll")}][INFO] REST API server started.`);
  console.log(`[${moment().format("llll")}][INFO] Listening on port 3000...`);
});
