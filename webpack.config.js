const webpack = require('webpack');
const HappyPack = require('happypack');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');


const isProductionBuild = process.env.WEBPACK_ENV === 'production';
const jsOutputFilename = isProductionBuild ? 'di-charts.min.js' : 'di-charts.js';
const cssOutputFilename = isProductionBuild ? 'di-charts.min.css' : 'di-charts.css';

// const limitChunkCountPlugin = new webpack.optimize.LimitChunkCountPlugin({
//   maxChunks: 1
// });

// const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

// const uglifyJsPlugin = new UglifyJSPlugin({
//   beautify: false,
//   mangle: {
//     screw_ie8: true,
//     keep_fnames: true,
//   },
//   compress: {
//     screw_ie8: true,
//     warnings: true
//   },
//   comments: false,
// });


module.exports = [
  {
    entry: [`${__dirname}/src/index.less`],

    output: {
      path: `${__dirname}/dist/`,
      filename: cssOutputFilename,
    },
    module: {
      rules: [{
        test: /\.less$/,
        use: ['css-loader', 'less-loader']
      }]
    },
    plugins: [
      new ProgressBarPlugin(),
    ]

  },
  {
    entry: [`${__dirname}/src/index.ts`],
    output: {
      path: `${__dirname}/dist/`,
      filename: '[name].js',
      library: 'DiCharts',
      libraryTarget: 'window',
    },
    module: {
      rules: [{
        test: /\.(ts|tsx)(\?[^?]*)?$/,
        loader: 'happypack/loader?id=ts'
      }],
    },

    plugins: [
      new HappyPack({
        threads: 4,
        id: 'ts',
        loaders: [{
          loader: 'ts-loader',
          query: {
            happyPackMode: true
          },
          options: {
            transpileOnly: true
          }
        }]
      }),
      new ForkTsCheckerWebpackPlugin({
        checkSyntacticErrors: true
      }),
      // limitChunkCountPlugin,
      new ProgressBarPlugin(),
    ],
    devtool: isProductionBuild ? 'source-map' : 'inline-source-map'
  }
];