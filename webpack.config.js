'use strict';

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './source/code/main.ts',
    devtool: 'inline-source-map',
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /(source\/shaders|node_modules)/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(jpg|jpeg|png|woff|woff2|eot|ttf|svg)$/,
                loader: 'url-loader?limit=100000'
            },
            {
                test: /\.pug$/,
                loader: 'html-loader?attrs=false'
            },
            {
                test: /\.pug$/,
                loader: 'pug-html-loader',
                options: {
                    data: {
                        data: require('./source/algorithms.json'),
                        specials: require('./source/algorithms_special.json'),
                    }
                }
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'docs'),
        library: undefined,
        libraryTarget: 'umd'
    },
    devServer: {
        open: true,
        contentBase: path.resolve(__dirname, "./source"),
        watchContentBase: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'source/pages/index.pug',
            inject: false
        }),
        new HtmlWebpackPlugin({
            filename: 'beginner.html',
            template: 'source/pages/beginner.pug',
            inject: false
        }),
        new HtmlWebpackPlugin({
            filename: 'speed_cubing.html',
            template: 'source/pages/speed_cubing.pug',
            inject: false
        }),
        new HtmlWebpackPlugin({
            filename: 'more.html',
            template: 'source/pages/more.pug',
            inject: false
        }),
        new HtmlWebpackPlugin({
            filename: 'practice.html',
            template: 'source/pages/practice.pug',
            inject: false
        }),
        new CopyWebpackPlugin([
            { from: 'source/css', to: 'css' }
        ]),
        new CopyWebpackPlugin([
            { from: 'source/img', to: 'img' }
        ]),
    ]
};
