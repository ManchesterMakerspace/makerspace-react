const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/app/main.tsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js"
  },
  module: {
    rules: [
      // {
      //   loader: "html-loader",
      //   options: {
      //     minimize: true,
      //     removeAttributeQuotes: false,
      //     caseSensitive: true,
      //     customAttrSurround: [[/#/, /(?:)/], [/\*/, /(?:)/], [/\[?\(?/, /(?:)/]],
      //     customAttrAssign: [/\)?\]?=/]
      //   }
      // },
      // {
      //   test: /\.tsx?$/,
      //   enforce: "pre",
      //   exclude: /(node_modules)/,
      //   use: [
      //     { loader: "cache-loader" },
      //     {
      //       loader: "tslint-loader",
      //       options: {
      //         typeCheck: false,
      //         emitErrors: true
      //       }
      //     }
      //   ]
      // },
      {
        test: /\.tsx?$/,
        use: [
          { loader: "cache-loader" },
          {
            loader: "ts-loader",
            options: {
              happyPackMode: true
            }
          }
        ]
      },
      // {
      //   test: /\.scss$/,
      //   use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
      // }
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
    disableHostCheck: true,
    proxy: {
      "/api": "http://localhost:3002"
    },
    https: false,
    port: 3035,
    inline: true,
    headers: { "Access-Control-Allow-Origin": "*" },
    watchOptions: { ignored: /node_modules/ }
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      checkSyntacticErrors: true,
      async: false
    }),
    new webpack.NamedModulesPlugin(),
    new MiniCssExtractPlugin({
      filename: `css/[name].css`
    })
  ]
};
