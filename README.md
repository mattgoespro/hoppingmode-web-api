# **hoppingmode-web-api** - An Opinionized GitHub REST API

## Description

**hoppingmode-web-api** is a REST API based on the Express Javascript framework.

The API serves as a proxy backend microservice that delegates API requests from the frontend to GitHub's REST and GraphQL APIs, and provides customized endpoints to suit the frontend's needs. It also provides a layer of security when working with Personal Access Tokens issued by GitHub required to securely access their APIs.

## Features

The following customized endpoints are provided:

- **GET** &nbsp;&nbsp;&nbsp;<code>_/repos_</code>
  - Returns a list of repositories and their details.
- **GET** &nbsp;&nbsp;&nbsp; <code>_/repos/:repoName/languages_</code>
  - Returns a map of recognized programming languages of a project and the percentage composition making up the project code.
- **GET** &nbsp;&nbsp;&nbsp; <code>_/repos/:repoName/readme_</code>
  - Retrieves the project content of the readme file _README.md_ as plaintext.

**hoppingmode-web-api** is an integral services that runs as a service as part of the **hoppingmode-web** Docker stack.
