import { resolve } from "path";
import { Configuration } from "webpack";
import nodeExternals from "webpack-node-externals";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";

const config: Configuration = {
  entry: "./src/app/index.ts",
  mode: "production",
  target: "node",
  output: {
    path: resolve(__dirname, "dist"),
    filename: "index.js"
  },
  resolve: {
    extensions: [".ts"],
    plugins: [new TsconfigPathsPlugin()]
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
  plugins: [new ForkTsCheckerWebpackPlugin()],
  externals: [nodeExternals()]
};

export default config;
