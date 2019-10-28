/* global require, module, __dirname */

const path = require('path');

const plugins = [];

module.exports = {
  entry: ['./src/roundware.js'],

  output: {
    filename: "roundware.js",

    library: "RoundwareWebFramework",
    libraryTarget: "umd",

    globalObject: 'this'
  },

  devtool: 'cheap-module-eval-source-map',

  devServer: {
    port: 8080,
    contentBase: [path.resolve(__dirname,"example")],
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
      }
    ]
  },

  plugins
};
