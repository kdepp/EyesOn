var webpack = require('webpack')
var path = require('path')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var { CleanWebpackPlugin } = require('clean-webpack-plugin')
var ZipPlugin = require('zip-webpack-plugin')
var VueLoaderPlugin = require('vue-loader/dist/plugin').default
var HtmlWebpackPlugin = require('html-webpack-plugin')
var HtmlWebpackIncludeSiblingChunksPlugin = require('html-webpack-include-sibling-chunks-plugin')
var BrowserExtensionWebpackPlugin = require('./build/browser_extension_webpack_plugin')
var manifestJson = require('./src/extension/templates/manifest.json')
var packageJson = require('./package.json')

const isSafari = process.env.BROWSER === 'safari'
const baseDir = isSafari ? path.join(__dirname, 'src', 'safari', 'Assets') : __dirname

var distDir = (function () {
  switch (process.env.BROWSER) {
    case 'firefox':
      return 'dist_ff'

    case 'safari':
      return 'extension'

    case 'chrome':
    default:
      return 'dist_crx'
  }
})()

const styleLoader = {
  loader: "style-loader",
  options: {
    injectType: "lazyStyleTag",
    insert: require.resolve("./build/custom_style_insert"),
  },
}

module.exports = {
  entry: Object.assign(
    {
      popup: './src/extension/scripts/popup/popup.ts',
      content_script_main: './src/extension/scripts/content_script/cs_main.ts',
      content_script_isolated: './src/extension/scripts/content_script/cs_isolated.ts',
      background: './src/extension/scripts/background/bg.ts'
    },
    !isSafari
      ? {}
      : {
          download: './src/apps/download/download.ts'
        }
  ),
  output: {
    path: path.join(baseDir, distDir),
    filename: '[name].js'
  },
  optimization: {
    splitChunks: {
      // Just to make it easy for safari extension so that we don't have change Info.plist
      chunks: (chunk) => (!isSafari ? true : chunk.name !== 'content_script'),
      automaticNameDelimiter: '_',
      maxSize: 1e6
    }
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.json'],
    alias: {
      '@': path.join(__dirname, 'src'),
      // '@safari': path.join(
      //   __dirname,
      //   'src',
      //   'safari',
      //   'polyfill',
      //   isSafari ? 'safari_app_polyfill.ts' : 'mock_polyfill.ts'
      // )
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          appendTsSuffixTo: [/\.vue$/]
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [path.join(__dirname, 'src')]
      },
      {
        test: /\.scss$/,
        use: [
          styleLoader,
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.css$/,
        use: [styleLoader, 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 2e6,
              esModule: false
            }
          }
        ]
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  },
  performance: {
    hints: false
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/extension/assets/**/*',
          to: '[name].[ext]'
        }
      ]
    }),
    new VueLoaderPlugin(),
    // new HtmlWebpackIncludeSiblingChunksPlugin(),
    new HtmlWebpackPlugin({
      chunks: ['popup'],
      template: './src/extension/templates/vue_page.html',
      filename: 'popup.html',
      templateParameters: {
        isSafari,
        pageType: 'popup',
        title: 'Popup'
      }
    }),
    ...(isSafari
      ? [
          new HtmlWebpackPlugin({
            chunks: ['background'],
            template: './src/extension/templates/vue_page.html',
            filename: 'background.html',
            templateParameters: {
              isSafari,
              pageType: 'background',
              title: 'Background'
            }
          }),
          new HtmlWebpackPlugin({
            chunks: ['download'],
            template: './src/extension/templates/vue_page.html',
            filename: 'download.html',
            templateParameters: {
              isSafari,
              pageType: 'Download',
              title: 'Download'
            }
          })
        ]
      : []),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"'
      },
      __development__: process.env.NODE_ENV === 'production' ? 'false' : 'true',
      __VUE_OPTIONS_API__: 'false',
      __VUE_PROD_DEVTOOLS__: 'false',
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
    }),
    new BrowserExtensionWebpackPlugin({
      createManifestJson: ({ getFilesForEntryPoint }) => {
        if (process.env.BROWSER === 'firefox') {
          // delete manifestJson['content_security_policy']
          delete manifestJson['key']
          delete manifestJson['background']['persistent']
        }

        manifestJson['version'] = packageJson['version']
        manifestJson['background']['scripts'] = getFilesForEntryPoint('background')
        manifestJson['content_scripts'][0]['js'] = getFilesForEntryPoint('content_script_main')
        manifestJson['content_scripts'][1]['js'] = getFilesForEntryPoint('content_script_isolated')

        return manifestJson
      }
    })
  ],
  stats: {
    warnings: false
  },
  devtool: 'inline-source-map'
}

if (process.env.NODE_ENV === 'production') {
  delete module.exports.devtool
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
    // new ZipPlugin({
    //   path: '..',
    //   filename: `${process.env.BROWSER || 'unknown'}_ext.zip`
    // })
  ])
}
