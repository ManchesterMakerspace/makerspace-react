const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = env => ({
  mode: "development",
  entry: ["@babel/polyfill", "./src/app/main.tsx"],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "makerspace-react.js",
    publicPath: "/"
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|svg)$/,
        type: "asset/inline"
      },
      {
        test: /\.(html)$/,
        use: {
          loader: "html-loader",
          options: {
            minimize: true,
          }
        }
      },
      {
        test: /\.tsx?$/,
        enforce: "pre",
        exclude: /(node_modules)/,
        use: [
          { loader: "cache-loader" },
          {
            loader: "tslint-loader",
            options: {
              typeCheck: false,
              emitErrors: true
            }
          }
        ]
      },
      {
        test: /\.(js|jsx|tsx|ts)$/,
        exclude: /(node_modules)/,
        use: [
          { loader: "cache-loader" },
          { loader: "babel-loader" }
        ]
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
      }
    ]
  },
  resolve: {
    plugins: [new TsconfigPathsPlugin()],
    extensions: [
      ".ts",
      ".tsx",
      ".js",
      ".jsx",
      ".scss",
      ".sass",
      ".less",
      ".png",
      ".woff",
      ".woff2",
      ".eot",
      ".ttf",
      ".svg",
      ".ico"
    ],
    modules: ["src", "node_modules"]
  },
  performance: {
    maxAssetSize: 200000,
    maxEntrypointSize: 400000
  },
  devtool: "source-map",
  context: __dirname,
  target: "web",
  devServer: {
    hot: true,
    historyApiFallback: true,
    proxy: [
      {
        context: ["/api"],
        target: "http://localhost:3002",
      },
    ],
    port: 3035,
    headers: { "Access-Control-Allow-Origin": "*" },
  },
  optimization: {
    moduleIds: "named",
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      checkSyntacticErrors: true,
      async: false
    }),
    new MiniCssExtractPlugin({
      filename: `makerspace-react.css`
    }),
    new HtmlWebPackPlugin({
      template: "./src/assets/index.html",
      filename: "./index.html"
    }),
    new CopyWebpackPlugin({ patterns: [{ from: "src/assets/favicon.png", to: "favicon.png" }] }),
    new webpack.EnvironmentPlugin({
      BILLING_ENABLED: true,
      BASE_URL: (env && env.BASE_URL) || ""
    }),
    ...process.env.ANALYZE ? [new BundleAnalyzerPlugin()] : []
  ]
});
