FROM node:20.2-alpine3.17

ARG NPM_TOKEN

RUN echo ${NPM_TOKEN}

WORKDIR /app

COPY .npmrc /root/.npmrc

COPY package*.json ./

RUN npm i

RUN rm -f /root/.npmrc

COPY . ./

RUN npm run build

CMD [ "node" , "dist/index.js" ]

EXPOSE 8080