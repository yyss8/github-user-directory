const webpackConfig = require('./webpack.config');

module.exports = config => {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        files: [
            'test/**/*Spec.js',
            'test/**/*Spec.jsx'
        ],
        preprocessors: {
            'test/**/*Spec.js': ['webpack'],
            'test/**/*Spec.jsx': ['webpack']
        },
        webpack: webpackConfig, 
        reporters: ['progress'],
        port: 3112,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome'],
        singleRun: true,
        concurrency: Infinity
    })
}