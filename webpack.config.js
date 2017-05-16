// var FlowBabelWebpackPlugin = require('flow-babel-webpack-plugin');
var FlowtypePlugin = require('flowtype-loader/plugin');

module.exports = {
  
  context: __dirname + "/",

  entry: "./src/index.js",

  output: {
    filename: "index.js",
    path: __dirname + "/dist",
    libraryTarget:"umd",
    library: 'Hivex',
    // umdNamedDefine: true, 

  },

  module: {
   loaders: [
      {test: /\.js$/, loader: 'flowtype-loader', enforce: 'pre', exclude: /node_modules/},
      {
        test: /.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ]
  },

  plugins: [
    new FlowtypePlugin(),
  ],

};
