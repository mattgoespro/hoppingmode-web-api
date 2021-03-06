# **hoppingmode-web-api** - A REST API for **hoppingmode-web-frontend**

## Description

**hoppingmode-web-api** is a REST API written in Express.js, which acts as a proxy backend to GitHub's REST and GraphQL API, with customized endpoints for **hoppingmode-web-frontend**'s needs. It is an integral services that forms part of the **hoppingmode-web** Docker stack.

## Use

**hoppingmode-web-api** provides the following REST endpoints:

- _/repos_ - retrieves all repositories for the given user.
- _/repos_ - retrieves all pinned repositories for the given user.
- _/repos/:repoName/languages_ - retrieves the programming language composition of a given project with the given name.
- _/repos/:repoName/readme_ - retrieves the README.md document of a given project with the given name.

The API uses a private Personal Access Token generated by GitHub for use as a bearer token for my login, which is loaded from a _.env_ file excluded from this project (see _.env.example_ for reference.).
