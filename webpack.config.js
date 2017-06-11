const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const isProductionBuild = process.env.WEBPACK_ENV === 'production';
const outputFilename = isProductionBuild ? `di-charts.min.js` : `di-charts.js`;

module.exports = {

  entry: [
    __dirname + '/src/index.js',
  ],

  output: {
    path: `${__dirname}/dist/`,
    filename: `${outputFilename}`,
    chunkFilename: `[id]-${outputFilename}`,
    library: "DiCharts",
    libraryTarget: "window"
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [['es2015', {modules: false}]],
          plugins: [
            'syntax-dynamic-import',
            'transform-object-rest-spread',
            'remove-webpack',
            'dynamic-import-node',
            'transform-runtime'
          ]
        }
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract(['css-loader', 'less-loader'])
      },

    ]
  },

  plugins: [

    new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1}),

    new ExtractTextPlugin(`di-charts.css`),

    ...isProductionBuild ? [

      new webpack.optimize.UglifyJsPlugin({
        beautify: false,
        mangle: {
          screw_ie8: true,
          keep_fnames: true
        },
        compress: {
          screw_ie8: true
        },
        comments: false
      }),

    ] : []

  ],

  devtool: 'source-map'
};