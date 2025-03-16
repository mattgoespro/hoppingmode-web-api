export type HttpRequestErrorOptions = {
  url: string;
  status: number;
  statusText: string;
  cause?: Error;
};

export class HttpRequestError extends Error {
  name: string = "HttpRequestError";

  constructor(
    message: string,
    public options: HttpRequestErrorOptions
  ) {
    super(message);
    this.message = this.getErrorMessage(message, options);
  }

  protected getErrorMessage(message: string, options: HttpRequestErrorOptions): string {
    return [message, `URL: ${options.url}`, `Status: ${options.status} ${options.statusText}`].join(
      "\n"
    );
  }
}

export function statusCodeToReason(code: number): string {
  switch (code) {
    case 200:
      return "OK";
    case 201:
      return "Created";
    case 204:
      return "No Content";
    case 304:
      return "Not Modified";
    case 400:
      return "Bad Request";
    case 401:
      return "Unauthorized";
    case 403:
      return "Forbidden";
    case 404:
      return "Not Found";
    case 405:
      return "Method Not Allowed";
    case 500:
      return "Internal Server Error";
    default:
      return "Unknown";
  }
}
