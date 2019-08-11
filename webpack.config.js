var path = require('path')
var webpack = require('webpack')

module.exports = {
  mode: process.env["ENVIRONMENT"] || "development",
  entry: './src/index',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: 'index.js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          appendTsSuffixTo: [/\.vue$/],
        }
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  resolve: {
    // https://stackoverflow.com/a/43596713
    extensions: ['.ts', '.js', '.vue', '.json']
  },
  devtool: '#eval-source-map'
}