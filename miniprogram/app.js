const config = require('./config/index')
const store = require('./utils/store')

App({
  globalData: {
    config,
    cloudReady: false,
    refreshDashboard: false
  },

  onLaunch() {
    store.ensureInitialized()

    if (config.cloudEnabled && wx.cloud) {
      wx.cloud.init({
        env: config.cloudEnv || undefined,
        traceUser: true
      })
      this.globalData.cloudReady = true
    }
  }
})
