
const TSDocgenPlugin = require('react-docgen-typescript-webpack-plugin');

const newRules = [
  {
      test: /\.(ts|tsx)(\?[^?]*)?$/,
      loader: 'awesome-typescript-loader'
  }
]

const newExtensions =  ['.ts', '.tsx', '.js'];

const newPlugins = [
  new TSDocgenPlugin()
];



module.exports = (baseConfig, env, config) => {
  // console.log(config);
  // config.module.rules.push({
  //   test: /\.(ts|tsx)$/,
  //   loader: require.resolve("awesome-typescript-loader")
  // });
  config.module.rules.push(...newRules);
  config.plugins.push(...newPlugins);
  config.resolve.extensions.push(...newExtensions);
  return config;
};