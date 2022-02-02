import { GraphQLClient } from "graphql-request";
import express, { Request, Response, NextFunction } from "express";
import { env } from "./environment";
import {
  GithubRepository,
  pinnedGithubReposRequest,
  GithubPinnedRepositories,
  createGithubRepoResponse,
} from "./index.model";
import path from "path";
import { Buffer } from "buffer";
import axios from "axios";
import morgan from "morgan";

function error(resp: Response, status: number, message: string) {
  return resp.status(status).json({
    reason: message,
  });
}

function setHeaders(_request: Request, response: Response, next: NextFunction) {
  response.set("Access-Control-Allow-Origin", "localhost");
  next();
}

(async function main() {
  const api = express(),
    DIST_DIR = __dirname,
    HTML_FILE = path.join(DIST_DIR, "index.html");

  api.use(setHeaders, morgan("[:date[web]] - [:method] :url [:status]"));

  const client = new GraphQLClient(env.githubGraphql, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `bearer ${env.githubPersonalAccessToken}`,
    },
  });

  api.get("/", (_request: Request, response: Response) => {
    // response.sendFile(HTML_FILE); // TODO: Not working with webpack.
  });

  api.get("/repos", (_request: Request, response: Response) => {
    console.log(`${env.githubApi}/users/${env.githubLogin}/repos`);
    axios
      .get<GithubRepository[]>(
        `${env.githubApi}/users/${env.githubLogin}/repos`
      )
      .then((githubRepos) => {
        client
          .request<GithubPinnedRepositories>(pinnedGithubReposRequest(10))
          .then((pinnedGithubRepos) => {
            response
              .status(200)
              .json(
                createGithubRepoResponse(githubRepos.data, pinnedGithubRepos)
              );
          })
          .catch((err) => {
            error(response, 500, err);
          });
      })
      .catch(() => {
        error(response, 500, `Unable to fetch projects. Please try again.`);
      });
  });

  api.get("/repos/:name/languages", (request: Request, response: Response) => {
    console.log(`${env.githubApi}/repos/${request.params.name}/languages`);
    axios
      .get<{ [key: string]: number }>(
        `${env.githubApi}/repos/${request.params.name}/languages`
      )
      .then((languages) => {
        response.status(200).json(languages);
      })
      .catch(() =>
        error(
          response,
          500,
          `Unable to fetch languages for project '${request.params.name}'`
        )
      );
  });

  api.get("/repos/:name/readme", (request: Request, response: Response) => {
    console.log(`${env.githubApi}/repos/
          ${request.params.name}
        /contents/README.md`);
    axios
      .get<{ content: string }>(
        `${env.githubApi}/repos/
          ${request.params.name}
        /contents/README.md`
      )
      .then((rsp) => {
        if (rsp.status === 404) {
          response.status(200).send("");
        } else if (rsp.status === 200) {
          const readmePayload = Buffer.from(
            rsp.data.content,
            "base64"
          ).toString();
          response.status(200).send(readmePayload.trim());
        } else {
          error(
            response,
            500,
            "An unexpected error occurred. Please try again."
          );
        }
      })
      .catch(() => {
        error(
          response,
          500,
          `Unable to fetch readme for project '${request.params.name}'`
        );
      });
  });

  api.listen(env.port, () => {
    console.log("=".repeat(50));
    console.log("=");
    console.log(`=   API listening on port ${env.port}...`);
    console.log("=");
    console.log("=".repeat(50));
  });
})();
