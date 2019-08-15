const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    devtool: "source-map",
    entry: {
        app: "./src/index.ts",
        auth: "./src/auth.tsx"
    },
    resolve: {
        extensions: [".ts", ".tsx", ".html", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: "ts-loader"
            },
            {
                test: /\.html$/,
                exclude: /node_modules/,
                use: "html-loader"
            },
            {
                test: /\.(png|jpg|jpeg|gif)$/,
                use: "file-loader"
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./index.html",
            chunks: ["app"]
        }),

        new HtmlWebpackPlugin({
            template: "./auth.html",
            chunks: ["auth"]
        })
    ]
};
