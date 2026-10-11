const config = require('../config/index')
const store = require('./store')

function isReady() {
  return Boolean(config.cloudEnabled && wx.cloud)
}

function call(action, payload) {
  if (!isReady()) {
    return Promise.resolve({
      ok: true,
      local: true,
      data: null
    })
  }

  return wx.cloud.callFunction({
    name: config.cloudFunctionName,
    data: {
      action,
      payload: payload || {}
    }
  }).then((response) => response.result)
}

function pull() {
  if (!isReady()) {
    return Promise.resolve(store.getData())
  }

  return call('getSnapshot').then((result) => {
    if (result && result.ok && result.data) {
      store.replaceAll(result.data)
      return result.data
    }
    if (result && result.ok && result.data === null) {
      const local = store.getData()
      return push().then(() => local)
    }
    throw new Error((result && result.message) || '云端数据读取失败')
  })
}

function push() {
  if (!isReady()) {
    return Promise.resolve()
  }
  return call('saveSnapshot', { snapshot: store.getData() })
}

function clearCloud() {
  if (!isReady()) {
    return Promise.resolve()
  }
  return call('clearSnapshot')
}

module.exports = {
  call,
  clearCloud,
  isReady,
  pull,
  push
}
