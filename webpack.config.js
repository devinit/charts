const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const isProductionBuild = process.env.WEBPACK_ENV === 'production';
const jsOutputFilename = isProductionBuild ? 'di-charts.min.js' : 'di-charts.js';
const cssOutputFilename = isProductionBuild ? 'di-charts.min.css' : 'di-charts.css';

const extractLess = new ExtractTextPlugin(cssOutputFilename);

const limitChunkCountPlugin = new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 });

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const uglifyJsPlugin = new UglifyJSPlugin({
  beautify: false,
  mangle: {
    screw_ie8: true,
    keep_fnames: true,
  },
  compress: {
    screw_ie8: true,
  },
  comments: false,
});

module.exports = [
  {
    entry: [`${__dirname}/src/index.less`],

    output: {
      path: `${__dirname}/dist/`,
      filename: cssOutputFilename,
    },

    module: {
      loaders: [
        {
          test: /\.less$/,
          use: extractLess.extract([
            { loader: 'css-loader', options: { minimize: isProductionBuild } },
            { loader: 'less-loader' },
          ]),
        },
      ],
    },

    plugins: [extractLess],

    devtool: 'source-map',
  },

  {
    entry: [`${__dirname}/src/index.js`],

    output: {
      path: `${__dirname}/dist/`,
      filename: `${jsOutputFilename}`,
      chunkFilename: `[id]-${jsOutputFilename}`,
      library: 'DiCharts',
      libraryTarget: 'window',
    },

    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: [['env', { modules: false }], 'flow'],
            },
          }
        },

        {
          test: /\.less$/,
          use: extractLess.extract(['css-loader', 'less-loader']),
        },
      ],
    },

    plugins: [limitChunkCountPlugin, extractLess, ...(isProductionBuild ? [uglifyJsPlugin] : [])],

    devtool: 'source-map',
  },
];
