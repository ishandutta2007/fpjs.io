var path = require('path')
var webpack = require('webpack')

module.exports = {
  mode: process.env["WEBPACK_ENV"] || "development",
  entry: {
    index: './src/index',
    demo: './src/demo'
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: '[name].js',
    library: "fpjsio"
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
    extensions: ['.ts', '.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  devtool: '#eval-source-map',
  plugins: [
    new webpack.EnvironmentPlugin({
      MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
      FPJS_API_TOKEN: process.env.FPJS_API_TOKEN,
      FPJS_LEAD_URL: process.env.FPJS_LEAD_URL
    })
  ]
}
if (process.env.WEBPACK_ENV === 'production') {
  module.exports.devtool = 'none';
} else {
  module.exports.devtool = '#eval-source-map';
}