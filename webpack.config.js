const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin') // 插件：复制静态资源
const CleanWebpackPlugin = require('clean-webpack-plugin') // 插件：清空打包目录
const HtmlWebpackPlugin = require('html-webpack-plugin') // 插件：生成html
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin') // 插件：单独提取css文件
const glob = require('glob')
const PurifyCSSPlugin = require('purifycss-webpack')
const WebpackParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')
const webpack = require('webpack')

module.exports = {
    entry: {
        index: path.resolve(__dirname, 'src', 'index.js'),
        page: path.resolve(__dirname, 'src', 'page.js')
        // vendor: 'lodash' // 多个页面所需公共库文件，防止重复打包
    },
    output: {
        publicPath: '/', // 静态资源CDN地址
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[hash].js'
    },
    optimization: {
        splitChunks: {
            commons: {
                chunks: 'initial',
                name: 'common',
                minChunks: 2,
                maxInitialResquests: 5,
                minSize: 0
            }
        }
    },
    resolve: {
        extensions: ['.js', '.css', '.json'],
        alias: {} // 别名配置。可以加快查找模块速度
    },
    module: {
        // 多个loader是有顺序要求的，从右往左写，因为转换的时候是从右往左转换的
        rules: [
            {
                test: /\.css$/,
                use: ExtractTextWebpackPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'postcss-loader'] // 不再需要style-loader放到html文件内
                }),
                include: path.join(__dirname, 'src'), // 限制范围，提高打包速度
                exclude: /node_modules/
            },
            {
                test: /\.less$/,
                use: ExtractTextWebpackPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'postcss-loader', 'less-loader']
                }),
                include: path.join(__dirname, 'src'),
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                use: ExtractTextWebpackPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'postcss-loader', 'sass-loader']
                }),
                include: path.join(__dirname, 'src'),
                exclude: /node_modules/
            },
            {
                test: /\.jsx?$/,
                use: {
                    loader: 'babel-loader'
                    // query: {
                    // 同时可以把babel配置写到根目录下的.babelrc中
                    // presets: ['env', 'stage-0'] // env转换es6 stage-0转es7
                    // }
                }
            },
            {
                // file-loader 解决css等文件中引入图片路径的问题
                // url-loader 当图片较小的时候会把图片BASE64编码，大于limit参数的时候还是使用file-loader 进行拷贝
                test: /\.(png|jpg|jpeg|gif|svg)/,
                use: {
                    loader: 'url-loader',
                    options: {
                        outputPath: 'images/', // 图片输出的路径
                        limit: 1024
                    }
                }
            }
        ]
    },
    plugins: [
        // 多入口的html文件用chunks这个参数来区分
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'index.html'),
            filename: 'index.html',
            chunks: ['index', 'vendor'],
            inject: 'body',
            hash: true, // 使用哈希 防止缓存
            minify: {
                removeAttributeQuotes: true // 压缩 去掉引号
            }
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'index.html'),
            filename: 'page.html',
            chunks: ['page', 'vendor'],
            inject: 'body',
            hash: true, // 使用哈希 防止缓存
            minify: {
                removeScriptTypeAttributes: true // 压缩 去掉引号
            }
        }),
        new webpack.ProvidePlugin({
            _: 'lodash' // 所有页面都会引入 _ 这个变量，不用再import引入
        }),
        new ExtractTextWebpackPlugin('css/[name].[hash].css'), // 其实这个特性只用于打包生产环境，测试环境这样设置会影响HMR
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, 'static'),
                to: path.resolve(__dirname, 'dist/static'),
                ignore: ['.*']
            }
        ]), // 拷贝static文件夹
        new CleanWebpackPlugin([path.join(__dirname, 'dist')]), // 清空dist目录
        new PurifyCssPlugin({
            paths: glob.sync(__dirname, 'src/*.html')
        }),
        new WebpackParallelUglifyPlugin({
            uglifyJS: {
                output: {
                    beautify: false, // 是否格式化
                    commets: false // 是否需要注释
                },
                compress: {
                    warnings: false, // 在UglifyJs删除没有用到的代码时不输出警告
                    drop_console: true, // 删除所有的 `console` 语句，可以兼容ie浏览器
                    collapse_vars: false, // 内嵌定义了但是只用到一次的变量
                    reduce_vars: true // 提取出出现多次但是没有定义成变量去引用的静态值
                }
            }
        }),
        new webpack.DllReferencePlugin({
            manifest: require(path.join(
                __dirname,
                '..',
                'dist',
                'mainfest.json'
            ))
        })
    ],
    externals: {},
    devtool: 'cheap-module-inline-source-map', // 指定加source-map的方式  eval-source-map
    devServer: {
        contentBase: path.join(__dirname, 'dist'), // 静态文件根目录
        port: 8080, // 端口
        host: 'localhost',
        overlay: true,
        compress: false // 服务器返回浏览器的时候是否启动gzip压缩
    },
    watch: true,
    watchOptions: {
        ignored: /node_modules/,
        aggregateTimeout: 500,
        poll: 1000
    }
}
