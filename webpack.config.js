const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const bodyParser = require('body-parser');
const request = require('request');

module.exports = (env, options) =>{

    const onProd = options.mode === 'production'; 
    const publicPath = onProd ? '//s3.scitweb.com/gu/':'/';

    const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
        template: './index.html',
        inject: 'body',
        templateParameters:{
            publicPath
        }
    })

    let plugins = [
        HtmlWebpackPluginConfig,
        new webpack.DefinePlugin({
            PUBLIC:JSON.stringify( publicPath ),
            RSF_URL:JSON.stringify(rsfUrl),
            GQL_URL:JSON.stringify(graphQlUrl),
            __VERSION__: JSON.stringify(require('./package.json').version),
            'process.env': {
                'NODE_ENV': JSON.stringify(options.mode)
            }
        }),
        new MiniCssExtractPlugin({
            filename: onProd ? "styles/m/[name].[hash].css":"[name].css",
            chunkFilename: onProd ? "styles/m/[id].[hash].css":"[id].css"
        })
    ];
    
    let moduleLoaders = [
        { test: /\.js$/, use: 'babel-loader', exclude: /node_modules/ },
        { test: /\.jsx$/, use: 'babel-loader', exclude: /node_modules/ }
    ];

    let optimization = {
        runtimeChunk: false,
        splitChunks: {
            cacheGroups: {
                default: false,
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'chunk',
                    chunks: 'all',
                    minChunks: 2
                }
            }
        }
    };
    
    if ( onProd ){
        moduleLoaders.push( { test: /\.css$/,use:[
            MiniCssExtractPlugin.loader,
            {
                loader:'css-loader',
                options:{
                    minimize: onProd
                }
            }
        ]});
    
        moduleLoaders.push( {
            test: /\.scss$/, 
            use: [
                MiniCssExtractPlugin.loader,
                {
                loader: 'css-loader', options: {
                    modules: true,
                    localIdentName: '[local]'
                }
                },
                {
                loader: 'postcss-loader',
                options: {
                    config: {
                    path: 'postcss.config.js' 
                    }
                }
                },
                'sass-loader'
            ]
        });

        optimization.minimizer = [
            new UglifyJSPlugin({
             cache: true,
              sourceMap: true,
              uglifyOptions: {
                compress: {
                  inline: false,
                  ecma: 6
                }
              }
            }),
            new OptimizeCSSAssetsPlugin({})
        ];

        plugins.push( new UploaderPlugin(uploaderOptions) );
        
    }else{
        //store css content in style tag for immediately hot reload for development mode  
        moduleLoaders.push( { test: /\.css$/, use: ['style-loader', { loader:'css-loader', options:{ minimize: false } }] } );
        moduleLoaders.push({
            test: /\.scss$/,
            use: [
              {loader:'style-loader'},
              {
                loader: 'css-loader', options: {
                  sourceMap: true, modules: true,
                  localIdentName: '[local]'
                }
              },
              {
                loader: 'postcss-loader',
                options: {
                  sourceMap: true,
                  config: {
                    path: 'postcss.config.js' 
                  }
                }
              },
              {
                loader: 'sass-loader', options: { sourceMap: true }
              }
            ]
        });
    }
    
    const src = path.resolve(__dirname, './');

    return {
        stats: {
            colors:true,
            hash: true,
            timings: true,
            assets: true,
            chunks: true,
            chunkModules: true,
            modules: true,
            children: true
        },
        mode: options.mode,
        entry: ['babel-polyfill', './index.js'],
        output: {
            path:path.resolve(__dirname, './final'),
            publicPath,
            filename:  onProd ? 'build/m/[name].[chunkhash].js':'build/bundle.js'
        },
        module: {
            rules: moduleLoaders
        },
        optimization,
        resolve:{
            alias:{
                'node_modules':path.resolve(__dirname,'node_modules'),
                '~':src + '/components',
                'u':src + '/utilities',
                'c':src + '/components/commons',
                'a':src + '/actions',
                static:path.resolve(__dirname, 'static')
            }
        },
        node: {
            fs: 'empty',
            net: 'empty',
            tls: 'empty',
            dns: 'empty',
            child_process:'empty'
        },
        plugins,
        devServer: {
            publicPath: "/",
            contentBase: "./public/",
            compress: false,
            port: 3111,
            historyApiFallback:true,
            hot:true,
            host:"0.0.0.0",
            public:"localhost:3111",
            open:true,
            before:(app) =>{

                //handle oauth access token fetching
                app.post('/auth', bodyParser.json(), (req, res) =>{

                    const baseUrl = 'https://github.com/login/oauth/access_token';
                    //unsecured to have secret in client side
                    const secretKey = '55955160a4425cd4a69b7ed51c3faf78ad00d884';
                    const clientId = '3aa8f369491b2bb00780';
                    const params = {
                        client_id:clientId,
                        client_secret:secretKey,
                        code:req.body.code,
                        state:'gh-schen',
                        redirect_uri:'http://localhost:3111/auth'
                    };

                    request(baseUrl, {
                        uri:baseUrl,
                        method:'POST',
                        json:params
                    }, (err, response) =>{
                        res.setHeader('Content-Type', 'application/json');
                        res.status(response.statusCode).send(JSON.stringify(response.body));
                    });
                });
            }
        },
    };
};