const CopyPlugin = require('copy-webpack-plugin');

const path = require('path');
const outputPath = 'dist';
const entryPoints = {
  game: path.resolve(__dirname, 'src', 'index.tsx')
};

var config = {
  entry: entryPoints,
  output: {
    path: path.join(__dirname, outputPath),
    filename: '[name].js',
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(jpg|jpeg|png|gif|woff|woff2|eot|ttf|svg)$/i,
        use: 'url-loader?limit=1024',
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          {
            loader: "css-loader",
            options: {
              modules: {
                namedExport: false
              }
            }
          }
        ]
      }
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{from: '.', to: '.', context: 'public'}],
    })
  ],
  devServer: {
    hot: "only",
    static: {
      directory:path.join(__dirname, 'dist'),
      serveIndex: true
    },
    port: 9099,
  }
};

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.devtool = 'source-map';
  }

  return config
};
