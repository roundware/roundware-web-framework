/* global require, module, __dirname */

const path = require('path');

const plugins = [];

module.exports = {
  entry: ['./dist/roundware.js'],

  output: {

    filename: "roundware.js",
    library: "RoundwareWebFramework",
    libraryTarget: "umd",
    globalObject: 'this'
  },

  devtool: 'source-map',
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
  },

  devServer: {
    port: 8080,
    contentBase: [path.resolve(__dirname, "example")],
    disableHostCheck: true,

    watchContentBase: true,

    watchOptions: {
      poll: 1000
    },

    overlay: {
      warnings: true,
      errors: true
    },
  },

  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "eslint-loader"
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      },
      // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
      { test: /\.tsx?$/, exclude: /node_modules/, loader: "ts-loader" },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { test: /\.js$/, exclude: /node_modules/, loader: "source-map-loader" },
    ]
  },

  plugins
};
