FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

# If you are building your code for production
# RUN npm ci --only=production

RUN npm install

# Copy source code to working directory.
COPY . .

# Build with webpack
RUN npm run build

# Map incoming requests on port 8082 to API port.
EXPOSE 8082

CMD [ "node", "dist/index.js", "--login=mattgoespro", "--PAT=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" ]
