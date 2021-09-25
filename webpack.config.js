/* global require, module, __dirname */

const path = require('path');

const plugins = [];

module.exports = {
  mode: "production",

  entry: ['./src/roundware.ts'],
  output: {
    filename: "roundware.js",
    library: "RoundwareWebFramework",
    libraryTarget: "umd",
    globalObject: 'this'
  },

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".js"],
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
      // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
      { test: /\.ts$/, exclude: /node_modules/, loader: "ts-loader" },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      // { test: /\.js$/, exclude: /node_modules/, loader: "source-map-loader" },
    ]
  },

  plugins
};
