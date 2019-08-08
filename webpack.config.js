var path = require("path");

const include = path.resolve(__dirname,'src');
//const dist    = path.resolve(__dirname,'dist');
const webpack = require('webpack'); //to access built-in plugins

module.exports = {
  entry: ['./src/roundware.js'],

  output: {
    filename: "roundware.js",

    libraryTarget: "umd",
    libraryExport: "default",
    library: "Roundware",

    //path: dist,
  },

  devtool: "source-map",

  devServer: {
    port: 8080,
    contentBase: [path.resolve(__dirname,"example")],
    watchContentBase: true,

    watchOptions: {
      poll: 1000
    },

    overlay: {
      warnings: true,
      errors: true
    },

    stats: "verbose"
  },

  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  }
};
