// webpack.config.js
const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/scripts/main.ts", // Entry point of your application
  target: "node", // Specify the environment (Node.js)
  module: {
    rules: [
      {
        test: /\.ts$/, // Use ts-loader for TypeScript files
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"], // Resolve these file extensions
  },
  output: {
    filename: "bundle.js", // Output bundle file
    path: path.resolve(__dirname, "public/scripts"), // Output directory
  },
};
