const tseslint = require("typescript-eslint");
const eslint = require("@eslint/js");
const eslintNode = require("eslint-plugin-n");

module.exports = tseslint.config(
  {
    ignores: ["dist/**/*", "node_modules/**/*", "temp/**/*", "eslint.config.js"]
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_"
        }
      ]
    }
  }
);
