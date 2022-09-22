import { GithubRestFileResponseDTO, GithubRestRepositoryResponseDTO } from "./github-api.model";
import { Buffer } from "buffer";
import { axiosHttpClient } from "../services/http-client";
import restServer from "../rest-server";
import { mapToApiRepositoryResponseDTO, sendErrorResponse } from "./rest-controller.model";
import { GithubGraphQlClient } from "../services/gql-client";
import { AxiosError } from "axios";

export interface ApiClientDetails {
  githubRestApiTarget: string;
  githubGraphqlApiTarget: string;
  githubApiLogin: string;
  githubApiPat: string;
}

export const RestApiServer = (apiDetails: ApiClientDetails) => {
  const httpClient = axiosHttpClient(apiDetails);
  const gqlClient = new GithubGraphQlClient(apiDetails);

  restServer.get("/", (_request, respond) => {
    respond.send("Hello, this is dog.");
  });

  async function doesGithubRepositoryExist(repoName: string) {
    return httpClient.get<GithubRestRepositoryResponseDTO[]>(`/repos/mattgoespro/${repoName}`);
  }

  async function doesFileExist(repoName: string, fileName: string) {
    const files = await httpClient.get<{ name: string }[]>(`/repos/mattgoespro/${repoName}/contents`);
    return files.data.find((file) => file.name === fileName);
  }

  restServer.get("/repos/:repoName", (request, respond) => {
    httpClient
      .get<GithubRestRepositoryResponseDTO>(`/repos/mattgoespro/${request.params.repoName}`)
      .then((resp) => {
        respond.status(200).json(mapToApiRepositoryResponseDTO(resp.data));
      })
      .catch((err) => sendErrorResponse(err, respond));
  });

  restServer.get("/repos", (request, respond) => {
    const queryParams = request.query;

    if (queryParams.pinned === "true") {
      gqlClient
        .getPinnedRepositories()
        .then((resp) => {
          respond.status(200).send(resp.mattgoespro.projects.pinned);
        })
        .catch((err) => sendErrorResponse(err, respond));
      return;
    }

    httpClient
      .get<GithubRestRepositoryResponseDTO[]>(`/users/mattgoespro/repos`)
      .then((resp) => respond.status(200).json(resp.data.map(mapToApiRepositoryResponseDTO)))
      .catch((err) => sendErrorResponse(err, respond));
  });

  restServer.get("/repos/:repoName/languages", async (request, respond) => {
    const repoName = request.params.repoName;

    doesGithubRepositoryExist(repoName)
      .then(() =>
        httpClient
          .get<{ [key: string]: number }>(`/repos/mattgoespro/${repoName}/languages`)
          .then((resp) =>
            respond.status(200).json({
              languages: resp.data,
            })
          )
          .catch((err) => sendErrorResponse(err, respond))
      )
      .catch((err) => sendErrorResponse(err, respond));
  });

  restServer.get("/repos/:repoName/readme", async (request, respond) => {
    const repoName = request.params.repoName;

    doesGithubRepositoryExist(repoName)
      .then(() => {
        doesFileExist(repoName, "README.md")
          .then(() => {
            httpClient
              .get<GithubRestFileResponseDTO>(`/repos/mattgoespro/${repoName}/contents/README.md`)
              .then((rsp) => respond.status(200).json({ content: Buffer.from(rsp.data.content, rsp.data.encoding).toString() }))
              .catch((err) => {
                if (err.code === AxiosError.ERR_BAD_REQUEST) {
                  // Repo has been created but is unprepared to take requests.
                  respond.status(200).json({ content: "" });
                }
              });
          })
          .catch((err) => {
            sendErrorResponse(err, respond);
          });
      })
      .catch((err) => {
        sendErrorResponse(err, respond);
      });
  });

  restServer.get("/repos/:repoName/skills", async (request, respond) => {
    const repoName = request.params.repoName;

    doesGithubRepositoryExist(repoName)
      .then(() => {
        doesFileExist(repoName, "portfolio.json")
          .then(() => {
            httpClient
              .get<GithubRestFileResponseDTO>(`/repos/mattgoespro/${repoName}/contents/portfolio.json`)
              .then((rsp) => respond.status(200).json(JSON.parse(Buffer.from(rsp.data.content, rsp.data.encoding).toString())))
              .catch((err) => {
                if (err.code === AxiosError.ERR_BAD_REQUEST) {
                  // Repo has been created but is unprepared to take requests.
                  respond.status(200).json({ content: "" });
                }
              });
          })
          .catch((err) => {
            sendErrorResponse(err, respond);
          });
      })
      .catch((err) => {
        sendErrorResponse(err, respond);
      });
  });

  return restServer;
};
