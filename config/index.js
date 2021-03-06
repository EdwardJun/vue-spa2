'use strict'
// Template version: 1.2.5
// see http://vuejs-templates.github.io/webpack for documentation.

const path = require('path')
// const prodSrc = {index: '/Users/joey/Dropbox/modo/spa-manager/WebRoot/spa/index.html', static: '/Users/joey/Dropbox/modo/spa-manager/WebRoot/spa/'}
const prodSrc = {index: 'E:/webworkspaces/spa-manager-2/WebRoot/spa/index.html', static: 'E:/webworkspaces/spa-manager-2/WebRoot/spa'}
// const prodSrc = {index: 'F:/xiaomodo/new-spa-manager/modo-web/spa/index.html', static: 'F:/xiaomodo/new-spa-manager/modo-web/spa/'}

module.exports = {
    dev: {

        // Paths
        assetsSubDirectory: 'static',
        assetsPublicPath: '/',
        proxyTable: {
            '/api': {
                // target: 'http://192.168.1.150:9880/spa-manager/api', // 春春
                // target: 'http://192.168.1.105:9880/spa-manager/api', // 105
                // target: 'http://192.168.1.92:8989/spa-manager/api',
                // target: 'http://localhost:8080/spa-manager/api',
                target: 'https://test.xiaomodo.com/spa-manager/api',
                // target: 'http://192.168.1.100:9880/spa-manager/api',      // 100服务器接口
                // target: 'http://spa.93wifi.com/spa-manager/api',            // 外网接口
                // target: 'http://192.168.2.93:8080/spa-manager/api',
                // target: 'http://192.168.3.112:8080/spa-manager/api',
                changeOrigin: true,
                pathRewrite: {
                    '^/api': ''
                }
            }
        },

        // Various Dev Server settings
        host: '0.0.0.0', // can be overwritten by process.env.HOST
        port: 8080, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
        autoOpenBrowser: false,
        errorOverlay: true,
        notifyOnErrors: true,
        poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-

        // Use Eslint Loader?
        // If true, your code will be linted during bundling and
        // linting errors and warnings will be shown in the console.
        useEslint: true,
        // If true, eslint errors and warnings will also be shown in the error overlay
        // in the browser.
        showEslintErrorsInOverlay: false,

        /**
         * Source Maps
         */

        // https://webpack.js.org/configuration/devtool/#development
        devtool: 'eval-source-map',

        // If you have problems debugging vue-files in devtools,
        // set this to false - it *may* help
        // https://vue-loader.vuejs.org/en/options.html#cachebusting
        cacheBusting: true,

        // CSS Sourcemaps off by default because relative paths are "buggy"
        // with this option, according to the CSS-Loader README
        // (https://github.com/webpack/css-loader#sourcemaps)
        // In our experience, they generally work as expected,
        // just be aware of this issue when enabling this option.
        cssSourceMap: true
    },

    build: {
        // Template for index.html
        index: path.resolve(__dirname, prodSrc.index),

        // Paths
        assetsRoot: path.resolve(__dirname, prodSrc.static),
        assetsSubDirectory: 'static',
        assetsPublicPath: '', // =======================build之后资源的路径修正

        /**
         * Source Maps
         */

        productionSourceMap: false,
        // https://webpack.js.org/configuration/devtool/#production
        devtool: '#source-map',

        // Gzip off by default as many popular static hosts such as
        // Surge or Netlify already gzip all static assets for you.
        // Before setting to `true`, make sure to:
        // npm install --save-dev compression-webpack-plugin
        productionGzip: false,
        productionGzipExtensions: ['js', 'css'],

        // Run the build command with an extra argument to
        // View the bundle analyzer report after build finishes:
        // `npm run build --report`
        // Set to `true` or `false` to always turn it on or off
        bundleAnalyzerReport: process.env.npm_config_report
    }
}
