import path from "path";
import nodeExternals from "webpack-node-externals";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";

const config = {
  entry: "./app/index.ts",
  mode: "production",
  target: "node",
  output: {
    path: path.resolve(__dirname, "dist"),
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
  externals: [nodeExternals()]
};

export default config;
