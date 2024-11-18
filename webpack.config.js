const path = require('path');
const webpack = require('webpack');

module.exports = [
    {
        entry: './popup.js',
        output: {
            filename: 'popup.js',
            path: path.resolve(__dirname, 'dist'),
        },
    },
    {
        entry: './background.js',
        output: {
            filename: 'background.js',
            path: path.resolve(__dirname, 'dist'),
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.PDF_API_KEY': JSON.stringify(process.env.PDF_API_KEY),
            }),
        ],
    },
]
