function toast(title, icon) {
  wx.showToast({
    title: title || '操作完成',
    icon: icon || 'none',
    duration: 1800
  })
}

function confirm(options) {
  const config = options || {}
  return new Promise((resolve) => {
    wx.showModal({
      title: config.title || '请确认',
      content: config.content || '',
      confirmText: config.confirmText || '确定',
      cancelText: config.cancelText || '取消',
      confirmColor: config.confirmColor || '#2F7257',
      success: (result) => resolve(Boolean(result.confirm)),
      fail: () => resolve(false)
    })
  })
}

function loading(title) {
  wx.showLoading({
    title: title || '处理中',
    mask: true
  })
}

function hideLoading() {
  wx.hideLoading()
}

module.exports = {
  confirm,
  hideLoading,
  loading,
  toast
}
