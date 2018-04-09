const path = require('path');
const webpack = require('webpack');
const HappyPack = require('happypack');
const packageJSON = require('../package.json');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const TSDocgenPlugin = require("react-docgen-typescript-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const SRC_PATH = path.join(__dirname, '../packages');

const configFile = path.join(__dirname, './tsconfig.json');

const newRules = [
  {
      test: /\.(ts|tsx)(\?[^?]*)?$/,
      loader: 'awesome-typescript-loader',
      options: {configFile}
  }
]

const newExtensions =  ['.ts', '.tsx', '.js'];

const newPlugins = [
  new TSDocgenPlugin(),
  // new ProgressBarPlugin(),
  // new HappyPack({
  //   threads: 4,
  //   id: 'ts',
  //   loaders: [{
  //     loader: 'ts-loader',
  //     query: { happyPackMode: true },
  //     options: { transpileOnly: true, configFile }
  //   }]
  // }),
  // new ForkTsCheckerWebpackPlugin({ checkSyntacticErrors: true }),
];



module.exports = (baseConfig, env, config) => {
  // console.log(config);
  // config.module.rules.push({
  //   test: /\.(ts|tsx)$/,
  //   loader: require.resolve("awesome-typescript-loader")
  // });
  config.module.rules.push(...newRules);
  // config.plugins.push(...newPlugins);
  config.resolve.extensions.push(...newExtensions);
  return config;
};