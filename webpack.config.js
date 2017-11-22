var path = require('path');
const Dotenv = require('dotenv-webpack');
var webpack = require('webpack');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.join(__dirname, '/public'),
        filename: 'bundle.js'
    },
    plugins: [
        new Dotenv({
            path: '.env',
            systemvars: true
        }),
        // Workaround for MapBox https://github.com/mapbox/mapbox-gl-js/issues/4359
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: false,
                comparisons: false,  // don't optimize comparisons
            },
        })
    ]
};