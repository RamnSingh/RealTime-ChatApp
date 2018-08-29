var webpack = {
    entry: "./app-client.js",
    output: {
        filename: "public/js/bundle.js"
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules|app.js)/,
                loader: 'babel-loader',
                query : {
                    presets : ['react']
                }
            }
        ]
    }
};

module.exports = webpack;