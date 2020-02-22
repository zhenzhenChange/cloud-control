module.exports = {
  devServer: {
    proxy: {
      "/cloud-api": {
        changeOrigin: true,
        target: process.env.VUE_APP_API_URL,
        pathRewrite: { "^/cloud-api": "/api" }
      }
    }
  },
  publicPath: process.env.VUE_APP_ROUTER_BASE
}
