'use strict';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

const pageList = [
    'index',
    'beginner',
    'speed_cubing',
    'patterns',
    'more',
    'practice'
];

const pages = pageList.map((pageName) => {
    return new HtmlWebpackPlugin({
        filename: pageName + '.html',
        template: './source/pages/' + pageName + '.pug',
        templateParameters: {
            data: require('./source/algorithms.json'),
            specials: require('./source/algorithms_special.json'),
            patterns: require('./source/patterns.json'),
        }
    })
});

const config = {
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
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            esModule: false,
                            name: '[name].css'
                        }
                    }
                ]
            },
            {
                test: /\.pug$/,
                loader: 'pug-loader'
            },
            {
                test: /\.(jpe?g|png|woff2?|eot|ttf|svg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            esModule: false,
                            name: '[name]_[md5:hash:hex:4].[ext]'
                        }
                    }
                ]
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build'),
        library: undefined,
        libraryTarget: 'umd',
    },
    devServer: {
        open: true,
        contentBase: path.resolve(__dirname, "./source"),
        watchContentBase: true
    },
    plugins: [
        ...pages
    ]
};

module.exports = (env, argv) => {
    const devMode = argv.mode === 'development';
    config.output.publicPath = devMode ? '/' : '/cubing-algorithms/';
    config.plugins.push(
        new FaviconsWebpackPlugin({
            logo: './source/img/cube.svg',
            mode: devMode ? 'light' : 'webapp'
        })
    );
    return config;
}
