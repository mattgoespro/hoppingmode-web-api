import { AxiosError } from "axios";
import Express from "express";
import { ClientError } from "graphql-request";
import { GraphQLResponse } from "graphql-request/build/esm/types";
import { StatusCodes } from "http-status-codes";
import { GitHubGraphqlErrorDTO } from "./services/github-api.dto";

/*
 *  Given an array of floats that sum to an integer, this rounds the floats
 *  and returns an array of integers with the same sum.
 *
 *  Source: https://stackoverflow.com/a/792476/6265995
 */
export function roundCascading(array: number[]): number[] {
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

/**
 * Handles different error types (Axios, Client or plain Error) and sends an error response.
 *
 * @param respond
 * @param error
 * @returns
 */
export function respondWithErrorStatus(
  respond: Express.Response,
  error: AxiosError | ClientError | Error
) {
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
    // if (error.response) {
    //   const gqlErrors = (error.response as GraphQLResponse & GitHubGraphqlErrorDTO[]).errors;

    //   let httpError = false;

    //   for (const err of gqlErrors) {
    //     if (err.type != null) {
    //       httpError = true;
    //       break;
    //     }
    //   }

    //   if (httpError) {
    //     try {
    //       respond.sendStatus(getHttpStatusCodeByType(gqlErrors[0].type));
    //     } catch (err) {
    //       // HTTP error type is unrecognized by the API.
    //       console.log("[FATAL] Unrecognized HTTP status type.");
    //       console.log(err);
    //       respond.sendStatus(500);
    //     }
    //   } else {
    //     // GraphQL query is invalid.
    //     console.log("[FATAL] GraphQL query is invalid.");
    //     respond.sendStatus(500);
    //   }
    // } else if (error.request) {
    //   /**
    //    * The request was never sent due to an unknown reason.
    //    */
    //   console.log(error.request);
    //   respond.sendStatus(500);
    // }

    return;
  }

  console.log(error);

  // An unknown error has occurred somewhere.
  respond.sendStatus(500);
}
