/* global require */

var webpack = require('webpack');
var webpackConfig = require('./webpack.config');

webpackConfig.plugins = [new webpack.LoaderOptionsPlugin({ debug: true })];
webpackConfig.entry = undefined;

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['mocha'],
    files: ['tests/index.js'],
    preprocessors: {
      'tests/index.js': ['webpack']
    },
    webpack: webpackConfig,
    reporters: ['spec'],
    mochaReporter: {
      showDiff: true
    },
    port: 9876,
    colors: true,
    browsers: ['Chrome'],
    captureTimeout: 60000,
    plugins: [
      require("karma-webpack"),
      require("karma-mocha"),
      require("karma-chrome-launcher"),
      require("karma-spec-reporter"),
      new webpack.LoaderOptionsPlugin({
	debug: true
      })
    ]
  });
};
