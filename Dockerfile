FROM node:19-alpine3.16

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY .env .

CMD [ "node" , "dist/index.js" ]

EXPOSE 8080