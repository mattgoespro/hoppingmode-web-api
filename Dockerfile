FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

CMD [ "node", "dist/index.js", "--github-api-login=mattgoespro", "--github-api-pat=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" ]

EXPOSE 8080
