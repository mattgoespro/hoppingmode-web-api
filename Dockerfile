FROM node:16

WORKDIR /usr/apps/api

COPY dist/apps/api .

CMD [ "node" , "main.js" ]

EXPOSE 8080