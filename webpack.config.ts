import { resolve } from "path";
import nodeExternals from "webpack-node-externals";
import webpack from "webpack";

const config: webpack.Configuration = {
  entry: "./app/index.ts",
  mode: "production",
  target: "node",
  output: {
    path: resolve(__dirname, "dist"),
    filename: "index.js"
  },
  resolve: {
    extensions: [".ts"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
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

export default config;
