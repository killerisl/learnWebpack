const path = require('path')
const webpack = require('webpack')

module.exports = {
    entry: {
        vendor: ['jquery', 'lodash']
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].dll.js',
        library: '_dll_[name]' // 全局变量名，其他模块会从此变量上获取里面模块
    },
    plugins: [
        new webpack.DllPlugin({
            name: '_dll_[name]',
            path: path.join(__dirname, 'dist', 'mainfest.json')
        })
    ]
}
