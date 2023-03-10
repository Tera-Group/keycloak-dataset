const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "production",
  entry: {
    // // Bundle builds: contain the whole set of library clients and features
    // "k6-keycloak-dataset": path.resolve(__dirname, "./src/index.ts"),
    // jslib.k6.io expects us to expose an `index.js` file
    index: path.resolve(__dirname, "./src/index.ts"),
    // admin: path.resolve(__dirname, "./src/admin/index.ts"),
  },
  output: {
    path: path.resolve(__dirname, "build"),
    libraryTarget: "commonjs",
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      //   {
      //     test: /\.ts$/,
      //     use: "babel-loader",
      //     exclude: /node_modules/,
      //   },
    ],
  },
  target: "web",
  externals: /^(k6|https?\:\/\/)(\/.*)?/,
  // Generate map files for compiled scripts
  devtool: "source-map",
  stats: {
    colors: true,
  },
  plugins: [
    new CleanWebpackPlugin(),
    // Copy assets to the destination folder
    // see `src/post-file-test.ts` for an test example using an asset
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "assets"),
          noErrorOnMissing: true,
        },
      ],
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};
