const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    // other webpack configurations...
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
        }),
        // other plugins...
    ],
};
