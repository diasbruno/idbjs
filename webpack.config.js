var path = require('path');

module.exports = {
  entry: './app/index.js',
  output: {
    filename: 'main.js',
    path: path.join(__dirname, 'app'),
    publicPath: ''
  },
  module: {
    loaders: [
      { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader' }
    ]
  }
};
