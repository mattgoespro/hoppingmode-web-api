module.exports = {
  presets: ["@babel/preset-env", "@babel/preset-typescript"],
  plugins: [
    "@babel/plugin-transform-runtime",
    "@babel/plugin-syntax-dynamic-import",
    "@babel/plugin-transform-class-properties"
  ]
};
