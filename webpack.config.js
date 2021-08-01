const path = require("path");
const miniCss = require("mini-css-extract-plugin");

module.exports = {
  mode: "development",

  entry: path.resolve(__dirname, "./index.ts"),
  
  module: {
    rules: [
      {
        test:/\.(s*)css$/,
        use: [miniCss.loader, "css-loader", "sass-loader"]
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: "ts-loader"
      }
    ],
  },

  plugins: [
    new miniCss({
      filename: "./css/main.css",
    }),
  ],

  resolve: {
    extensions: [".ts"]
  },
  
  output: {
    path: path.resolve(__dirname, "res"),
    filename: "./js/bundle.js"
  }
};