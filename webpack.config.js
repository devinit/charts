var path = require('path');
var webpack = require('webpack');

var isProductionBuild = process.env.WEBPACK_ENV == 'production';
var outputFilename = isProductionBuild ? 'di-charts.min.js' : 'di-charts.js';

var plugins = [
  new webpack.optimize.LimitChunkCountPlugin({
    maxChunks: 0
  })
];

if (isProductionBuild) {
  plugins = [
    ...plugins,

    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
      output: {
        comments: false,
      },
    }),

  ]
}

module.exports = {
  entry: __dirname + '/src/index.js',
  output: {
    path: __dirname + '/dist/',
    filename: outputFilename,
    chunkFilename: `[id]-${outputFilename}`,
    library: "DiCharts",
    libraryTarget: "window"
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      options: {
        presets: [['es2015', {modules: false}]],
        plugins: [
          'syntax-dynamic-import',
          'transform-object-rest-spread',
          'remove-webpack'
        ]
      }
    }]
  },
  plugins: plugins,
  devtool: 'source-map'
};