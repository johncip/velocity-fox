const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  resolve: {
    alias: {
      Config: path.resolve(__dirname, 'config')
    }
  },
  entry: {
    app: './src/index.js'
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    hot: true,
    overlay: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Velocity Fox',
      favicon: path.resolve(__dirname, 'assets', 'favicon.png'),
    }),
    new CleanWebpackPlugin(['dist']),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.ProvidePlugin({
      'fetch': 'fetch-everywhere'
    }),
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, "src"),
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          presets: ['env', 'react'],
          plugins: ['transform-object-rest-spread']
        }
      },
      {
        test: /\.(s*)css$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(jpg|png|gif|svg)$/,
        use: 'file-loader'
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: 'file-loader'
      }
    ]
  },
  // postcss: function() {
  //   return [
  //     autoprefixer({
  //       browsers: [
  //         '>1%',
  //         'last 4 versions',
  //         'Firefox ESR',
  //         'not ie < 9',
  //       ]
  //     }),
  //   ];
  // },
};
