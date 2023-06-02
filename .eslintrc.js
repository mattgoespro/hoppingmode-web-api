module.exports = {
  env: {
    amd: true,
    node: true
  },
  extends: [
    "eslint:recommended",
    "prettier",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: ["@typescript-eslint"],
  settings: {
    "import/resolver": {
      typescript: {}
    }
  },
  rules: {
    "prettier/prettier": [
      "error",
      {
        singleQuote: false,
        parser: "typescript"
      }
    ],
    "arrow-body-style": "off",
    "prefer-arrow-callback": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }]
  }
};
