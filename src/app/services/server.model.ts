import { AxiosError } from "axios";
import { ClientError } from "graphql-request";
import { StatusCodes } from "http-status-codes";

export type ApiErrorResponse = {
  status: number;
};

export class ApiError extends Error {
  constructor(private error: Error | AxiosError | ClientError) {
    super(error.message);
  }

  private mapGqlToHttpStatus(type: string) {
    switch (type) {
      case "BAD_REQUEST":
        return StatusCodes.BAD_REQUEST;
      case "UNAUTHORIZED":
        return StatusCodes.UNAUTHORIZED;
      case "FORBIDDEN":
        return StatusCodes.FORBIDDEN;
      case "NOT_FOUND":
        return StatusCodes.NOT_FOUND;
      case "INTERNAL_SERVER_ERROR":
        return StatusCodes.INTERNAL_SERVER_ERROR;
      case "SERVICE_UNAVAILABLE":
        return StatusCodes.SERVICE_UNAVAILABLE;
      default:
        throw new Error(`Unmapped GQL response error type '${type}'`);
    }
  }

  /**
   * Handles different error types (Axios or GraphQl Client) and sends an error response.
   *
   * @param error
   * @returns
   */
  private mapErrorToApiError<T extends Error>(error: T): ApiErrorResponse {
    if (error instanceof AxiosError) {
      if (error.response) {
        /**
         * GitHub responded with (5xx, 4xx) error code.
         */
        const status = error.response.status;

        switch (status) {
          case StatusCodes.NOT_FOUND:
            return {
              status: StatusCodes.NOT_FOUND
            };
          case StatusCodes.INTERNAL_SERVER_ERROR:
            return {
              status: StatusCodes.SERVICE_UNAVAILABLE
            };
          case StatusCodes.UNAUTHORIZED:
            return {
              status: StatusCodes.INTERNAL_SERVER_ERROR
            };
          case StatusCodes.FORBIDDEN:
            return {
              status: StatusCodes.INTERNAL_SERVER_ERROR
            };
          case StatusCodes.BAD_REQUEST:
            return {
              status: StatusCodes.INTERNAL_SERVER_ERROR
            };
          default:
            console.error(`Unhandled axios status code '${status}'`);
            return {
              status: StatusCodes.INTERNAL_SERVER_ERROR
            };
        }
      } else if (error.request) {
        /**
         * The request was never sent, probably due to invalid endpoint requests or
         * faulty network connection.
         */
        console.error(`Request failure`);
        return {
          status: StatusCodes.INTERNAL_SERVER_ERROR
        };
      }

      throw new Error(`Unhandled axios error type`);
    } else if (error instanceof ClientError) {
      const gqlError = error.response.errors[0] as unknown as { type: string };
      return {
        status: this.mapGqlToHttpStatus(gqlError.type)
      };
    }

    console.error("In internal error occurred");
    throw this.error;
  }

  public getApiError(): ApiErrorResponse {
    return this.mapErrorToApiError(this.error);
  }
}
