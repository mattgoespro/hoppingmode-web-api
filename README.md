# **hoppingmode-web-api** - A Personalized GitHub API Gateway Service

## Description

**hoppingmode-web-api** is an Express REST API gateway microservice to GitHub's public API. It is an integral project forms part of the **hoppingmode-web** Docker stack.

The API provides simplified REST endpoints to suit Hoppingmode Frontend's needs. It also obfuscates the GitHub HTTP request authorization required by GitHub, and increases the request daily limit.

## Features

The following endpoints are provided:

- **GET** &nbsp;&nbsp;&nbsp;<code>_/repos_</code>
  - Returns a list of repositories and their details.
- **GET** &nbsp;&nbsp;&nbsp; <code>_/repos/:repoName/languages_</code>
  - Returns a map of programming languages recognized by GitHub as well as their percentage contribution to the project.
