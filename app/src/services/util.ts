import { AxiosError } from "axios";
import { Response } from "express";
import { ClientError } from "graphql-request";
import { GraphQLResponse } from "graphql-request/dist/types";
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

export function respondWithApiError(respond: Response, err: AxiosError | ClientError) {
  if ("isAxiosError" in err) {
    const error: AxiosError = err;

    if (error.response) {
      /**
       * Server responded with (5xx, 4xx) error code
       */
      respond.sendStatus(error.response.status);
    } else if (err.request) {
      /**
       * Server did not receive a response, request was never
       * transmitted.
       */
      respond.sendStatus(500);
    }
  } else {
    const error: ClientError = err;

    if (error.response) {
      const resp = error.response as GraphQLResponse & GitHubGraphqlErrorResponse;
    } else if (err.request) {
      respond.sendStatus(500);
    }
  }
}
