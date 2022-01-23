import { GraphQLClient, gql } from 'graphql-request'; 
import express = require('express');
import { env } from './environment';

const app = express()

const pinnedReposRequest = gql`
  {
    user(login: "mattgoespro") {
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
        }
      }
    }
  }
}`

const client = new GraphQLClient(env.githubGraphql, {
  headers: {
    Authorization: `bearer ${env.githubPersonalAccessToken}`
  }
});

app.get('/repositories/pinned', (req: any, res: any) => {
  client.request(pinnedReposRequest).then((resp: any) => {
    console.log(JSON.stringify(resp, undefined, 2));
  });
})

app.get('/', (req: any, res: any) => {
  res.send('<a href="http://localhost:3000/repositories/pinned">Get Pinned Repositories</a>');
})

app.listen(env.port, () => {
  console.log("=".repeat(50));
  console.log("=");
  console.log(`=   API listening on port ${env.port}...`)
  console.log("=");
  console.log("=   Open in browser: http://localhost:3000/");
  console.log("=");
  console.log("=".repeat(50));

})