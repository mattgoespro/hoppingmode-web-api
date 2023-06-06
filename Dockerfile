FROM node:20.2-alpine3.17 as build-step

WORKDIR /app

COPY package*.json ./

# Set NPM registry login auth token for private package downloads
RUN --mount=type=secret,id=npm_secret \
    grep npm_ /run/secrets/npm_secret >> ./.npmrc

RUN npm ci

COPY . ./

RUN npm run build

FROM node:20.2-alpine3.17

ENV NODE_ENV=production
ENV PORT=3000
ENV PROXY_GITHUB_AUTH_TOKEN=GITHUB_AUTH_TOKEN

COPY --from=build-step /app/node_modules ./node_modules
COPY --from=build-step /app/dist ./dist

CMD [ "node" , "./dist/index.js" ]

EXPOSE 8080
