/** @type {import('@graphql-codegen/cli').CodegenConfig} */
const config = {
  overwrite: true,
  schema: "./tools/github-api.schema.graphql",
  generates: {
    "src/app/generated/github-api.schema.ts": {
      plugins: ["typescript", "typescript-document-nodes"]
    }
  }
};

module.exports = config;
