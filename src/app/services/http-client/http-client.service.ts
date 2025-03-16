import { Axios, AxiosRequestConfig, AxiosResponse } from "axios";
import chalk from "chalk";
import { HttpRequestError, statusCodeToReason } from "./model";

type HttpDetails = {
  status: number;
  method: string;
  url: string;
  params: Record<string, string>;
};

function getHttpLogString(details: HttpDetails): string {
  const MaxStringLength = 20;

  const { method, url, status, params } = details;

  let formattedParams = "";

  if (params != null) {
    const urlParams = new URLSearchParams(params);
    const urlParamParts = Array.from(urlParams).map(([paramName, paramValue]) => {
      const value =
        paramValue.length > MaxStringLength
          ? `${paramValue.slice(0, MaxStringLength)}...`
          : paramValue;
      return `${chalk.bold(paramName)}=${chalk.italic(value)}`;
    });

    formattedParams = `(${urlParamParts.join(", ")})`;
  }

  const urlString = chalk.lightGrey.bold(url);
  const paramString = chalk.gray(formattedParams);
  const statusString = chalk.bold(status?.toString());
  const statusTextString = chalk.bold(statusCodeToReason(status));
  const methodString = chalk.whiteBright.bold(method.toUpperCase());

  let colorizeSuccessStatus = null;

  switch (true) {
    case status >= 200 && status < 300:
      colorizeSuccessStatus = chalk.green;
      break;
    case status > 300 && status < 400:
      colorizeSuccessStatus = chalk.yellow;
      break;
    default:
      colorizeSuccessStatus = chalk.red;
  }

  return [
    // prefixString,
    methodString,
    urlString,
    paramString,
    colorizeSuccessStatus(statusString),
    colorizeSuccessStatus(statusTextString)
  ].join(" ");
}

type HttpInterceptLogger = {
  info: (message: string) => void;
  error: (message: string) => void;
};

type HttpClientOptions<InterceptLogger extends HttpInterceptLogger> = AxiosRequestConfig & {
  logger: InterceptLogger;
};

export class HttpClient<
  InterceptLogger extends HttpInterceptLogger = HttpInterceptLogger
> extends Axios {
  constructor(private config: HttpClientOptions<InterceptLogger>) {
    super({ ...config, validateStatus: (status) => status >= 200 && status < 400 });

    this.interceptors.response.use(
      // called when the request receives a response
      this.responseFulfilledInterceptor.bind(this),
      // called when the request fails to receive a response
      this.responseRejectedInterceptor.bind(this)
    );
  }

  private responseFulfilledInterceptor(response: AxiosResponse) {
    const status = response.status;
    const method = response.config.method;
    const url = response.config.url;
    const params = response.config.params;

    this.config.logger.info(
      getHttpLogString({
        status,
        method,
        url,
        params
      })
    );

    if (response.status >= 400) {
      throw new HttpRequestError(`Request failed`, {
        url: response.config.url,
        status: response.status,
        statusText: response.statusText,
        cause: response.data
      });
    }

    const responseType = response.config.responseType ?? "json";
    const responseData = response.data;

    if (responseType === "json" && typeof responseData === "string") {
      response.data = JSON.parse(response.data);
    }

    return response;
  }

  private responseRejectedInterceptor(response: AxiosResponse): void {
    this.config.logger.error(`No response received requesting '${response.config.url}'`);
  }
}
