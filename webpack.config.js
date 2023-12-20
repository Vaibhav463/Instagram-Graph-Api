const webpack = require('webpack');

module.exports = {
    resolve: {
        fallback: {
            "http": require.resolve("stream-http"),
            "https": require.resolve("https-browserify"),
            "stream": require.resolve("stream-browserify"),
            "util": require.resolve("util/"),
            "buffer": require.resolve("buffer/"),
            "crypto": require.resolve("crypto-browserify"),
            "zlib": require.resolve("browserify-zlib"),
            "assert": require.resolve("assert/"),
            "os": require.resolve("os-browserify/browser"),
            "path": require.resolve("path-browserify"),
            "vm": require.resolve("vm-browserify"),
            "constants": require.resolve("constants-browserify"),
            "timers": require.resolve("timers-browserify"),
            "process": require.resolve("process/browser"),
            "querystring": require.resolve("querystring-es3"),
            "tty": require.resolve("tty-browserify"),
            "fs": false,
            "net": false,
            "tls": false,
            "child_process": false
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ],
};
