import { gql } from "graphql-request";

const GITHUB_REPOSITORY_TOPICS_GQL = gql`
      topics: repositoryTopics(first: 10) {
        list: nodes {
          ... on RepositoryTopic {
            topicItem: topic {
              name
            }
          }
        }
      }
    `;

export const GITHUB_LIST_REPOSITORIES_GQL = gql`
  {
    payload: user(login: "mattgoespro") {
      pinned: pinnedItems(first: 6, types: REPOSITORY) {
        list: nodes {
          ... on Repository {
            name
            description
            url
            createdAt
            updatedAt
            ${GITHUB_REPOSITORY_TOPICS_GQL}
          }
        }
      }
      all: repositories(first: 20, ownerAffiliations: OWNER, privacy: PUBLIC) {
        list: nodes {
          ... on Repository {
            name
            description
            url
            createdAt
            updatedAt
            ${GITHUB_REPOSITORY_TOPICS_GQL}
          }
        }
      }
    }
  }
`;

export function createViewRepositoryGqlRequest(repoName: string) {
  return gql`
        {
          payload: user(login: "mattgoespro") {
            repository(name: "${repoName}") {
              readme: object(expression: "main:README.md") {
                ... on Blob {
                  content: text
                  encoding: text
                }
              }
              commit: object(expression: "main") {
                ... on Commit {
                  history {
                    totalCount
                  }
                }
              }
              ... on Repository {
                name
                createdAt
                updatedAt
              }
            }
          }
        }
      `;
}
