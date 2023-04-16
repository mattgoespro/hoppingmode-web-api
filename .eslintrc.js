module.exports = {
  env: {
    es2021: true
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  parser: "@typescript-eslint/parser",
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
        parser: "flow"
      }
    ],
    "arrow-body-style": "off",
    "prefer-arrow-callback": "off"
  }
};
