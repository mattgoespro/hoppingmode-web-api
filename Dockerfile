FROM node:20.2-alpine3.17

ARG NPM_AUTH_TOKEN

WORKDIR /app

RUN echo "//registry.npmjs.org/:_authToken=${NPM_AUTH_TOKEN}" >> ./.npmrc

COPY package*.json ./
RUN npm i

COPY . ./

RUN npm run build

CMD [ "node" , "dist/index.js" ]

EXPOSE 8080
