FROM node:16

WORKDIR /app

COPY package*.json .
RUN npm ci

COPY .env .
COPY dist .

CMD [ "node" , "index.js" ]

EXPOSE 8080