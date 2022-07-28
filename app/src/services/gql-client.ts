import { GraphQLClient } from "graphql-request";
import { ApiClientDetails } from "../controllers/rest-controller.service";

export const graphqlClient = (apiInfo: ApiClientDetails) => {
  return new GraphQLClient(apiInfo.githubGraphqlApiTarget, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `bearer ${apiInfo.githubApiPat}`,
    },
  });
};
