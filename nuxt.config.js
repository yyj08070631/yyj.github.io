const webpack = require('webpack')
const pconfig = require('./publish-config').default

module.exports = {
  // Headers of the page
  head: {
    title: 'YYJ\'s blog',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'YYJ\'s blog' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: './static/favicon.ico' },
      // { rel: 'stylesheet', href: 'https://cdn.bootcss.com/bootstrap/3.3.7/css/bootstrap.min.css' },
      { rel: 'stylesheet', href: 'https://cdn.bootcss.com/font-awesome/4.7.0/css/font-awesome.min.css' }
    ],
    script: [
      // { src: 'https://cdn.bootcss.com/jquery/3.2.1/jquery.min.js' },
    ]
  },
  // Global CSS
  css: [
    '~/assets/css/main.css',
    'element-ui/lib/theme-chalk/index.css'
  ],
  // plugins
  plugins: [
    { src: '~plugins/vue-socket.io', ssr: false},
    { src: '~plugins/element-ui', ssr: true},
    { src: '~plugins/marked', ssr: true}
  ],
  // Add axios globally
  build: {
    vendor: ['axios', 'marked', 'lodash', 'element-ui', 'vue-socket.io'],
    plugins: [
      new webpack.ProvidePlugin({
        axios: 'axios',
        _: 'lodash',
        marked: 'marked'
      })
    ],
    extend(config, ctx) {
      if (ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    },
    extend(config, ctx) {
      if (ctx.isClient) {
        config.module.rules.push({
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: [/node_modules/, /.nuxt/]
        })
      }
    }
  },
  env: {
    baseUrl: pconfig.url
  }
}
