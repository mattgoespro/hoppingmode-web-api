# hoppingmode-web-api

## Overview

The **hoppingmode-web-api** project is a Docker microservice that runs alongside **hoppingmode-web-frontend**, my Code Portfolio website.

## Features

### Proxy Server

The backend provides several functions as a proxy to GitHub's API:

1. The endpoints exposed to the frontend are custom tailored, simpler, and more intuitive.
2. The burden of requesting (from GitHub directly), receiving, and collating response data to work with is taken from the frontend.
3. It provides better, more predictable error handling.
4. The frontend need not concern itself with API authorization and secret-keeping - that is all managed by the backend.
