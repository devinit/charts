var path = require('path');
var webpack = require('webpack');

var isProductionBuild = process.env.WEBPACK_ENV == 'production';
var outputFilename = isProductionBuild ? 'charts.min.js' : 'charts.js';

var plugins = isProductionBuild ? [
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false,
    },
    output: {
      comments: false,
    },
  })
] : [];

module.exports = {
  entry: __dirname + '/src/index.js',
  output: {
    path: __dirname + '/dist/',
    filename: outputFilename
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }]
  },
  plugins: plugins,
  devtool: 'source-map'
};