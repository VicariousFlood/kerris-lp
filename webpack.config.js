/*******************************************************************************
 * REQUIRE
 */
const path              = require('path');
const fs                = require('fs');
const Dotenv            = require('dotenv-webpack');
const webpack           = require('webpack');
const WebpackDevServer  = require("webpack-dev-server");

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// const autoprefixer      = require('autoprefixer'); //di wywalenia  boo??? sprawdzic czy cos innego nie zapltwa tego


// UWAGA:
// Umieścić  w pliku startowym js taki zapis, aby w trybie hot
// webpackowgo live-serwara  nadzorować zmiany w pliku index.html
//
// if (process.env.NODE_ENV !== 'production') {
//     require('file-loader!../index.html')
// }

var config =  {

    // Te tryby 'mode' są przekazywane w wywołaniu i nie
    // musze ich tu na sztywno ustawiać.
    // Nie mam jak sprawdzić czy działają.
    // mode: 'development',
    // mode: 'production',

    /*************************************************************************
     * ENTRY
     */
    entry: {
        vendors: [
            'jquery',
            'bootstrap',
            'waypoints',
            'animate.css',
            'fontawesome5-webfont',
            'fontawesome5-regular',
            //'fontawesome5-brands',
            'fontawesome5-solid',
        ],
        main: path.resolve(__dirname, 'src/scripts/main.js')
    },

    /*************************************************************************
     * MODULS
     *
     * Jest też możliwość wczytywania styli nie w poniższej
     * deklaracji modułów, lecz bezpośrenio przy
     * imporcie: https://webpack.js.org/concepts/loaders/#inline
     * jednak to rozwiązanie wydaje mi się fajniejsze
     */
    module:{
        rules: [{
            // test: /\.js$/,                                                 // Wymaga:  jshint-loader, jshint
            // enforce: "pre",                                                // PRELOAD the jshint loader
            // exclude: /node_modules/,
            // use: [
            //   { loader: "jshint-loader",
            //     options: {
            //         camelcase: true,
            //         emitErrors: false,
            //         failOnHint: false,
            //     }}
            // ]
        },{
            test: /\.css$/,                                                   // Wymaga: css-loader, style-loader
            use: [
                { loader: 'style-loader',
                    options: { sourceMap:true }
                },
                { loader: 'css-loader',
                    options: { sourceMap:true, minimize:false, importLoaders:1 }
                },
                {
                    loader: 'postcss-loader',
                    options: {
                        ident: 'postcss',
                        // plugins: [
                        //     require('autoprefixer')()
                        // ],
                        config: {path:'postcss.config.js'}
                    }
                }
            ]
        },{
            test: /\.ts$/,                                                    // Wymaga: ts-loader
            use: [{ loader: 'ts-loader' }]
        }, {
            test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
            use: [{
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: 'dist/assets/fonts/',                         // lokacja docelowa dla fontów
                    publicPath: '../fonts/'                                   // naspisuje domyślną ścieżkę ??
                }
            }]
        },
            {
                test: /\.scss$/,                                                  // Wymaga: scss-loader, mode-sass, webpack
                use:
                    ['css-hot-loader'].concat(                                   // Zapewnia livereload styli w trybie HMR (hot module replacement)
                        ExtractTextPlugin.extract({                               // Zapewnia wyextraktowanie styli do osobnej paczki z preparowanego bundla
                            fallback: 'style-loader',
                            use: [
                                { loader: 'css-loader',
                                    options: { importLoaders: 1, sourceMap: true, minimize: false }
                                },
                                {
                                    loader: 'postcss-loader',                         //
                                    options: {
                                        ident: 'postcss',
                                        plugins: [
                                            require('autoprefixer')
                                        ],
                                        sourceMap: true
                                    }
                                },
                                { loader: 'sass-loader',
                                    options: { sourceMap: true }
                                }
                            ]
                        })
                    )
            },{
                test: /\.js$/,                                                    // Wymaga: babel-loader babel-core babel-preset-env webpack
                exclude: /node_modules/,
                use: [
                    { loader: 'babel-loader',
                        options: { presets: ['env'] }}
                ]
            }]
    },


    /*************************************************************************
     * RESOLVER
     */
    resolve: {
        alias: {
            'modernizr$':           path.resolve(__dirname, ".modernizr-autorc"),
            'waypoints':            path.resolve('node_modules', 'waypoints/lib/jquery.waypoints.js'),
            'fontawesome5-webfont': path.resolve('node_modules', 'fontawesome5-webfont/scss/fontawesome.scss'),
            'fontawesome5-regular': path.resolve('node_modules', 'fontawesome5-webfont/scss/fa-regular.scss'),
            'fontawesome5-brands':  path.resolve('node_modules', 'fontawesome5-webfont/scss/fa-brands.scss'),
            'fontawesome5-solid':   path.resolve('node_modules', 'fontawesome5-webfont/scss/fa-solid.scss'),
        }
    },


    /*************************************************************************
     * PLUGINS
     */
    plugins: [
        new Dotenv(),
        new webpack.ProvidePlugin({
            $:                    'jquery',
            jQuery:               'jquery',
            "window.jQuery":      'jquery',
            bootstrap:            'bootstrap',
            Popper:               ['popper.js', 'default'],
        }),


        new ExtractTextPlugin({
            filename: 'dist/assets/style/[name].bundle.css',                    // Wydziela z bandla style
            disable: false,                                                     // Wyłącza ten plugin
            allChunks: true
        }),

        new HtmlWebpackPlugin({                                                 // Generuje plik html z osadzonymi kkryptami i stylami
            minify: {
                collapseWhitespace: false,                                  // Minimalizacja pliku
                removeComments: true,                                       // Usuwanie komentarzy
                removeRedundantAttributes: true                             // Usuwanie duplikwatów atrybutów
                // removeScriptTypeAttributes: true,
                // removeStyleLinkTypeAttributes: true,
            },
            hash: true,                                                         // Dołączany jest do plików js i styli unikalny ciąg alfanumeryczny
            template: './src/index.html',                                       // Pobiera template do wygenerowania ostatecznego pliku
            filename: path.resolve(__dirname, 'dist/index.html')                // Docelowy plik
        }),

        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin()                               // Automatyczne wstrzykiwanie zmian w trybie localserverka
    ],

    /*************************************************************************
     * DEV TOOL
     */
    devtool: 'source-map',
    // stats: {
    //   colors: true,
    //   reasons: true
    // },

    /*************************************************************************
     * SERVER
     */
    devServer: {
        contentBase: path.join(__dirname, "dist"),
        compress: false,                                                      // Dotyczy prawdopodobnie tylko webserwera
        stats: "minimal",                                                     // Status informacji: verbose|normal|minimal|errors-only|none
        open: true,                                                          // Otwiera przeglądarkę
        hot: true,                                                            // Replacement without page refresh
        inline: true,
        progress: true,
        // https: true,
        // https: {
        //    key:  fs.readFileSync("/path/to/server.key"),
        //    cert: fs.readFileSync("/path/to/server.crt"),
        //    ca:   fs.readFileSync("/path/to/ca.pem"),
        // }
        index: 'dist/index.html'                                                // plik od którego ma zacząć
    },

    /*************************************************************************
     * OUTPUT
     */
    output: {
        //devtoolLineToLine: true, //przestarzałe
        path:       path.resolve(__dirname, ''),
        filename:   'dist/assets/scripts/[name].bundle.js'
    }
};

















/***************************
 * ENVIROMENT SETUP
 */
module.exports = function (env) {

    env = process.env.NODE_ENV ? process.env.NODE_ENV.trim().toLowerCase() : 'development';

    console.log('█████████████████████████████████████████████████████████████████████████');
    console.log('██████████████████████     W E B P A C K     ████████████████████████████');
    console.log('█████████████████████████████████████████████████████████████████████████');
    console.log('\n');
    console.log('   Processing: webpack.config.js \n');
    console.log('   Enviroming:', env.toUpperCase(), '\n' );

    if(env == 'development') {
        config.devtool = 'source-map';
        console.log('   Sourcemap: ' + config.devtool);
    }
    else {
        config.devtool = false;
        console.log('   Sourcemap: none');
    }

    console.log('\n');
    console.log('█████████████████████████████████████████████████████████████████████████');

    return config;
}
