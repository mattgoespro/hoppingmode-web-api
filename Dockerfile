FROM node:19-alpine3.16

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY . ./

RUN npm run build

CMD [ "node" , "dist/index.js" ]

EXPOSE 8080