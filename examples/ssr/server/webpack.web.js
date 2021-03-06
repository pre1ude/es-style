const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: [
    'react-hot-loader/patch',
    'webpack-hot-middleware/client?path=/webpack-hmr&timeout=2000&quiet=true&reload=true&overlay=false',
    './client.js',
  ],
  output: {
    filename: '[name].js',
    publicPath: '/',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /\/node_modules\//,
        loader: 'babel-loader',
        options: {
          presets: ['es2015', 'react', 'stage-0'],
          plugins: [
            [
              require('../../../babel').default,
              {
                publicPath: '/',
                imageOptions: {
                  path: 'dist/images/',
                  limit: 50,
                },
              },
            ],
            [
              require.resolve('babel-plugin-module-resolver'),
              {
                alias: {
                  'es-style': require.resolve('../../../'),
                  'es-style/server': require.resolve('../../../server'),
                },
              },
            ],
          ],
        },
      },
      {},
    ],
  },
  resolveLoader: {
    modules: ['node_modules', join(__dirname, 'loaders')],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
};
