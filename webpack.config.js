const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const isProductionBuild = process.env.WEBPACK_ENV === 'production';
const jsOutputFilename = isProductionBuild ? `di-charts.min.js` : `di-charts.js`;
const cssOutputFilename = isProductionBuild ? `di-charts.min.css` : `di-charts.css`;

const extractLess = new ExtractTextPlugin(cssOutputFilename);

const limitChunkCountPlugin = new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1});

const uglifyJsPlugin = new webpack.optimize.UglifyJsPlugin({
  beautify: false,
  mangle: {
    screw_ie8: true,
    keep_fnames: true
  },
  compress: {
    screw_ie8: true
  },
  comments: false
});

module.exports = [

  {

    entry: [
      __dirname + '/src/index.less',
    ],

    output: {
      path: `${__dirname}/dist/`,
      filename: cssOutputFilename
    },

    module: {
      loaders: [

        {
          test: /\.less$/,
          use: extractLess.extract([
            {loader: 'css-loader', options: {minimize: isProductionBuild}},
            {loader: 'less-loader'}
          ])
        },

      ]
    },

    plugins: [
      extractLess,
    ],

    devtool: 'source-map'
  },

  {

    entry: [
      __dirname + '/src/index.js',
    ],

    output: {
      path: `${__dirname}/dist/`,
      filename: `${jsOutputFilename}`,
      chunkFilename: `[id]-${jsOutputFilename}`,
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
            presets: [['es2015', {modules: false}], "flow"],
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
          use: extractLess.extract(['css-loader', 'less-loader'])
        },

      ]
    },

    plugins: [

      limitChunkCountPlugin,

      ...(isProductionBuild ? [uglifyJsPlugin] : [])

    ],

    devtool: 'source-map'
  },

];