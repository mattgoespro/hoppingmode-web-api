import { resolve } from "path";
import nodeExternals from "webpack-node-externals";

module.exports = {
  entry: "./app/index.ts",
  mode: "production",
  target: "node",
  output: {
    path: resolve(__dirname, "dist"),
    filename: "index.js"
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
            cacheCompression: false
          }
        }
      }
    ]
  },
  externals: [nodeExternals()]
};
