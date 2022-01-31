import { GraphQLClient } from "graphql-request";
import express, { Request, Response, NextFunction } from "express";
import { env } from "./environment";
import {
  GithubProject,
  pinnedGithubReposRequest,
  PinnedRepositories,
} from "./app.model";
import path from "path";
import { Buffer } from "buffer";
import axios from "axios";
import morgan from "morgan";

function sortedRepos(githubRepos: GithubProject[], pinned: PinnedRepositories) {
  return githubRepos
    .map((githubRepo) => ({
      ...githubRepo,
      pinned: pinned.user.pinnedItems.nodes
        .map((p) => p.name)
        .includes(githubRepo.name),
    }))
    .sort((repo1, repo2) => {
      return (repo1.pinned ? 1 : -1) - (repo2.pinned ? 1 : -1);
    });
}

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
  const api = express();

  api.use(setHeaders, morgan("[:date[web]] - [:method] :url [:status]"));

  const client = new GraphQLClient(env.githubGraphql, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `bearer ${env.githubPersonalAccessToken}`,
    },
  });

  api.get("/", (_request: Request, response: Response) => {
    response.sendFile(path.join(__dirname, "../public/index.html"));
  });

  api.get("/repos", (_request: Request, response: Response) => {
    axios
      .get<GithubProject[]>(`${env.githubApi}/users/${env.githubLogin}/repos`)
      .then((githubRepos) => {
        client.request<PinnedRepositories>(pinnedGithubReposRequest).then(
          (pinnedGithubRepos) => {
            response
              .status(200)
              .json(sortedRepos(githubRepos.data, pinnedGithubRepos));
          },
          (rejection) => {
            response.json(JSON.stringify(rejection));
            error(response, 500, rejection);
          }
        );
      });
  });

  api.get("/repos/:name/languages", (request: Request, response: Response) => {
    axios
      .get<{ [key: string]: number }>(
        `${env.githubApi}/${encodeURIComponent(request.params.name)}/languages`
      )
      .then((languages) => {
        response.status(200).json(languages);
      });
  });

  api.get("/repos/:name/readme", (request: Request, response: Response) => {
    axios
      .get<{ content: string }>(
        `${env.githubApi}/repos/${env.githubLogin}/${encodeURIComponent(
          request.params.name
        )}/contents/README.md`
      )
      .then((rsp) => {
        if (rsp.status === 404) {
          error(response, 404, "No Readme found");
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
      });
  });

  api.listen(env.port, () => {
    console.log("=".repeat(50));
    console.log("=");
    console.log(`=   API listening on port ${env.port}...`);
    console.log("=");
    console.log("=   Open in browser: http://localhost:3000/");
    console.log("=");
    console.log("=".repeat(50));
  });
})();
