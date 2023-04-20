module.exports = {
  env: {
    amd: true,
    node: true
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {},
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
    "prefer-arrow-callback": "off"
  }
};
