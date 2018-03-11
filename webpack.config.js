const path               = require('path');
const webpack            = require('webpack');
// const autoprefixer      = require('autoprefixer');

const PATHS = {
  app: path.join(__dirname, 'src'),
  images:path.join(__dirname,'src/assets/'),
  build: path.join(__dirname, 'dist')
};

// const options = {
//   host:'localhost',
//   port:'1080'
// };

module.exports = {
  entry: {
    app: PATHS.app
  },
  output: {
    path: PATHS.build,
    filename: 'bundle.js'
  },
  // devServer: {
  //     historyApiFallback: true,
  //     hot: true,
  //     inline: true,
  //     stats: 'errors-only',
  //     host: options.host,
  //     port: options.port
  //   },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          cacheDirectory: true,
          presets: ['es2015']
        }
      },
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader'],
        include:PATHS.app
      },

      {
        test: /\.(ico|jpg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
        loader: 'file-loader',
        query: {
          name: '[path][name].[ext]'
        }
      },
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
  plugins:[
    new webpack.HotModuleReplacementPlugin({
        multiStep: false
    })
  ]
};
