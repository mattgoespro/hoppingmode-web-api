import { AxiosError } from "axios";
import { Response } from "express";
import { ClientError } from "graphql-request";
import { GraphQLResponse } from "graphql-request/dist/types";
import { StatusCodes } from "http-status-codes";
import { GitHubGraphqlErrorResponse } from "../model/github.model";

/*
 *  Given an array of floats that sum to an integer, this rounds the floats
 *  and returns an array of integers with the same sum.
 *
 *  Source: https://stackoverflow.com/a/792476/6265995
 */
export function cascadeRounding(array: number[]): number[] {
  let fpTotal = 0;
  let intTotal = 0;
  const roundedArray: number[] = [];

  array.forEach((num) => {
    const rounded = Math.round(num + fpTotal) - intTotal;
    fpTotal += num;
    intTotal += rounded;
    roundedArray.push(rounded);
  });

  return roundedArray;
}

function getHttpStatusCodeByType(type: string) {
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
      throw new Error(`Unrecognized HTTP code type '${type}'`);
  }
}

export function respondWithHttpErrorStatus(respond: Response, error: AxiosError | ClientError | Error) {
  if ("isAxiosError" in error) {
    if (error.response) {
      /**
       * GitHub responded with (5xx, 4xx) error code.
       */
      respond.sendStatus(error.response.status);
    } else if (error.request) {
      /**
       * The request was never sent due to an unknown reason.
       */
      respond.sendStatus(500);
    }

    return;
  } else if (error instanceof ClientError) {
    if (error.response) {
      const errorResponse = error.response as GraphQLResponse & GitHubGraphqlErrorResponse;
      const responseErrors = errorResponse.errors;
      const err = responseErrors[0];

      try {
        respond.sendStatus(getHttpStatusCodeByType(err.type));
      } catch (err) {
        // HTTP error type is unrecognized by the API.
        respond.sendStatus(500);
      }
    } else if (error.request) {
      // The GQL query string is malformed.
      respond.sendStatus(500);
    }

    return;
  }

  // An unknown error has occurred somewhere.
  // TODO: Log
  respond.sendStatus(500);
}
