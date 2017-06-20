var path = require("path");

const include = path.resolve(__dirname,'src');
const dist    = path.resolve(__dirname,'dist');
const webpack = require('webpack'); //to access built-in plugins

export default {
  entry: ['./src/roundware.js'],

  output: {
    filename: "roundware.umd.js",
    path: dist,
    pathinfo: true,
    libraryTarget: "umd",
    library: "Roundware",
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
    loaders: [
      {test: /\.js$/, loader: 'babel-loader', include},
      {test: /\.json$/, 'loader': 'json-loader', include},
    ]
  }
};
