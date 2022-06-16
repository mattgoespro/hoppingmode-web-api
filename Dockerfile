FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

CMD [ "node", "dist/index.js", "--github-api-login=mattgoespro", "--github-api-pat=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" ]

EXPOSE 8080
