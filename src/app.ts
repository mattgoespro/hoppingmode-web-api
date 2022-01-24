import { GraphQLClient } from "graphql-request";
import express, { Request, Response, NextFunction } from "express";
import { env } from "./environment";
import {
  GithubProject,
  pinnedGithubReposRequest,
  PinnedRepositories,
} from "./app.model";
import path from "path";

(async function main() {
  const apiServer = express();

  const client = new GraphQLClient(env.githubGraphql, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `bearer ${env.githubPersonalAccessToken}`,
    },
  });

  apiServer.get("/", (request: Request, response: Response) => {
    response.sendFile(path.join(__dirname, "../public/index.html"));
  });

  apiServer.get("/repos", (request: Request, response: Response) => {
    fetch(`${env.githubApi}/users/${env.githubLogin}/repos`)
      .then<GithubProject[]>((rsp) => rsp.json())
      .then((repos) => {
        client.request(pinnedGithubReposRequest).then(
          (resp: PinnedRepositories) => {
            console.log(JSON.stringify(resp.user.pinnedItems.nodes));
            response.set("Access-Control-Allow-Origin", "*");
            response.json(
              repos
                .map((repo) => ({
                  ...repo,
                  pinned: resp.user.pinnedItems.nodes
                    .map((p) => p.name)
                    .includes(repo.name),
                }))
                .sort((a, b) => {
                  return (b.pinned ? 1 : -1) - (a.pinned ? 1 : -1);
                })
            );
          },
          (rejection) => {
            console.log(rejection);
            response.json(JSON.stringify(rejection));
          }
        );
      });
  });

  apiServer.get(
    "/repos/:name/languages",
    (request: Request, response: Response) => {
      fetch(`${env.githubApi}/${request.params.name}/languages`)
        .then((resp) => resp.json())
        .then((languages) => response.json(languages));
    }
  );

  apiServer.get(
    "/repos/:name/readme",
    (request: Request, response: Response) => {
      fetch(
        `${env.githubApi}/repos/${env.githubLogin}/${request.params.name}/contents/README.md`
      ).then((rsp) => {
        if (rsp.status === 404) {
          response.send("No Readme found.");
        } else if (rsp.status === 200) {
          rsp.json().then((rsp) => {
            const readmePayload = Buffer.from(rsp.content, "base64").toString();
            response.send(readmePayload.trim());
          });
        } else {
          response.sendStatus(500);
        }
      });
    }
  );

  apiServer.listen(env.port, () => {
    console.log("=".repeat(50));
    console.log("=");
    console.log(`=   API listening on port ${env.port}...`);
    console.log("=");
    console.log("=   Open in browser: http://localhost:3000/");
    console.log("=");
    console.log("=".repeat(50));
  });
})();
