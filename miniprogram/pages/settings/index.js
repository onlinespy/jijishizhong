const config = require('../../config/index')
const store = require('../../utils/store')
const cloud = require('../../utils/cloud')
const feedback = require('../../utils/feedback')
const { generateDemoData } = require('../../utils/demo-data')

Page({
  data: {
    waterReminder: false,
    periodReminder: false,
    templates: config.subscriptionTemplates,
    cloudEnabled: config.cloudEnabled,
    demoDataEnabled: config.demoDataEnabled,
    version: config.version
  },

  onShow() {
    const settings = store.getData().settings
    this.setData({
      waterReminder: Boolean(settings.waterReminder),
      periodReminder: Boolean(settings.periodReminder)
    })
  },

  toggleReminder(event) {
    const type = event.currentTarget.dataset.type
    const enabled = event.detail.value
    const field = type === 'water' ? 'waterReminder' : 'periodReminder'

    if (!enabled) {
      this.saveReminder(field, false)
      return
    }

    const templateId = config.subscriptionTemplates[type]
    if (!templateId) {
      this.setData({ [field]: false })
      wx.showModal({
        title: '尚未配置订阅模板',
        content: '请先在微信公众平台申请订阅消息模板，并将模板 ID 填入 miniprogram/config/index.js。没有用户主动授权时，小程序不能发送提醒。',
        showCancel: false,
        confirmText: '我知道了',
        confirmColor: '#2F7257'
      })
      return
    }

    wx.requestSubscribeMessage({
      tmplIds: [templateId],
      success: (result) => {
        if (result[templateId] === 'accept') {
          this.saveReminder(field, true)
          feedback.toast('订阅授权已开启', 'success')
        } else {
          this.setData({ [field]: false })
          feedback.toast('未获得订阅授权')
        }
      },
      fail: () => {
        this.setData({ [field]: false })
        feedback.toast('订阅请求未完成')
      }
    })
  },

  saveReminder(field, value) {
    store.update((draft) => {
      draft.settings[field] = value
    })
    this.setData({ [field]: value })
    cloud.push().catch(() => {})
  },

  clearRecords() {
    feedback.confirm({
      title: '清除全部记录',
      content: '将清除断食、饮食、运动、体重、喝水和经期记录。个人档案与提醒设置会保留。此操作无法恢复。',
      confirmText: '继续',
      confirmColor: '#777777'
    }).then((firstConfirmed) => {
      if (!firstConfirmed) {
        return
      }
      return feedback.confirm({
        title: '再次确认',
        content: '确定永久清除所有健康打卡记录吗？',
        confirmText: '永久清除',
        confirmColor: '#777777'
      }).then((secondConfirmed) => {
        if (!secondConfirmed) {
          return
        }
        store.resetRecords()
        return cloud.clearCloud()
          .then(() => feedback.toast('全部记录已清除', 'success'))
          .catch(() => feedback.toast('本地已清除，云端同步失败'))
      })
    })
  },

  openAgreement(event) {
    wx.navigateTo({
      url: `/pages/agreement/index?type=${event.currentTarget.dataset.type}`
    })
  },

  fillDemoData() {
    feedback.confirm({
      title: '生成演示数据',
      content: '将覆盖现有全部打卡记录，并写入约两周的演示数据。正式发布前请保持此功能关闭。'
    }).then((confirmed) => {
      if (!confirmed) {
        return
      }
      generateDemoData()
      cloud.push().catch(() => {})
      feedback.toast('演示数据已生成', 'success')
    })
  }
})
