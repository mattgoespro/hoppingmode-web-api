import { GraphQLClient } from "graphql-request";
import express, { Request, Response, NextFunction } from "express";
import {
  pinnedGithubReposRequest,
  GithubPinnedRepositories,
  createGithubRepoResponse,
} from "./app.model";
import { Buffer } from "buffer";
import axios from "axios";
import morgan from "morgan";
import { env } from "../environment";
import moment from "moment";

interface ErrorResponse {
  status: number;
  cause: any;
  message: string;
}

function respondError(
  error: any,
  message: string,
  respond: Response,
  alternateResponseStatus?: number
) {
  const errorResponse: ErrorResponse = {
    status: error?.status ?? alternateResponseStatus ?? 500,
    cause: !error || error === {} ? "Unknown" : error,
    message,
  };
  return respond.status(errorResponse.status).json(errorResponse);
}

function setHeaders(_request: Request, response: Response, next: NextFunction) {
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Authorization", `bearer ${env.githubPersonalAccessToken}`);
  next();
}

export function main() {
  const api = express();

  api.use(setHeaders, morgan("[:date[web]] - [:method] :url [:status]"));

  const graphql = new GraphQLClient(env.githubGraphql, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `bearer ${env.githubPersonalAccessToken}`,
    },
  });

  api.get("/", (_request: Request, response: Response) => {
    // response.sendFile(HTML_FILE); // TODO: Not working with webpack.
  });

  api.get("/repos", async (_request: Request, respond: Response) => {
    try {
      const githubRepos = await axios.get(
        `${env.githubApi}/users/${env.githubLogin}/repos`
      );
      const pinnedGithubRepos = await graphql.request<GithubPinnedRepositories>(
        pinnedGithubReposRequest(10)
      );
      respond
        .status(200)
        .json(createGithubRepoResponse(githubRepos.data, pinnedGithubRepos));
    } catch (err) {
      respondError(err, "Failed to retrieve repositories.", respond, 500);
    }
  });

  api.get("/repos/:name/languages", (request: Request, respond: Response) => {
    axios
      .get(
        `${env.githubApi}/repos/${env.githubLogin}/${request.params.name}/languages`
      )
      .then((languages: { data: any }) => {
        respond.status(200).json(languages.data);
      })
      .catch((err: any) => {
        console.log(err);
        respondError(
          err,
          `Unable to fetch languages for project '${request.params.name}'.`,
          respond
        );
      });
  });

  api.get("/repos/:name/readme", (request: Request, respond: Response) => {
    axios
      .get<{ content: string }>(
        `${env.githubApi}/repos/${env.githubLogin}/
          ${request.params.name}
        /contents/README.md`
      )
      .then((rsp: { data: { content: any }; status: number }) => {
        let payload = rsp.data.content;
        if (rsp.status === 404) {
          payload = "";
        } else if (rsp.status === 200) {
          payload = Buffer.from(payload, "base64").toString().trim();
        }
        respond.status(200).send(payload);
      })
      .catch((err: any) => {
        respondError(
          err,
          `Unable to fetch readme for project '${request.params.name}'.`,
          respond
        );
      });
  });

  api.listen(3000, () => {
    console.log(`[${moment().format("llll")}][INFO] Starting API server...`);
    console.log(
      `[${moment().format("llll")}][SUCCESS] Listening on port 3000.`
    );
  });
}
