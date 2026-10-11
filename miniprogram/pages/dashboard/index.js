const config = require('../../config/index')
const store = require('../../utils/store')
const cloud = require('../../utils/cloud')
const feedback = require('../../utils/feedback')
const dateUtil = require('../../utils/date')
const calc = require('../../utils/calc')
const { getTemplate } = require('../../data/fasting')
const { createId } = require('../../utils/id')

Page({
  data: {
    today: '',
    dateLabel: '',
    profile: {},
    plan: {},
    template: {},
    timeline: {},
    fastingStatus: {},
    countdown: '00:00:00',
    planStatusText: '未设置',
    planStopped: false,
    checkedIn: false,
    waterTarget: 2000,
    waterTotal: 0,
    waterProgress: 0,
    waterReminder: false,
    waterRingStyle: '',
    dietCalories: 0,
    exerciseCalories: 0,
    calorieDifference: 0,
    waterAmounts: [200, 300, 500]
  },

  onLoad() {
    this.refresh()
    this.startTimer()
  },

  onShow() {
    this.syncTabBar()
    this.refresh()
    this.startTimer()
  },

  syncTabBar() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
  },

  onHide() {
    this.stopTimer()
  },

  onUnload() {
    this.stopTimer()
  },

  onPullDownRefresh() {
    this.loadCloudThenRefresh().finally(() => wx.stopPullDownRefresh())
  },

  startTimer() {
    this.stopTimer()
    this.timer = setInterval(() => this.updateCountdown(), 1000)
  },

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  },

  loadCloudThenRefresh() {
    if (!cloud.isReady()) {
      this.refresh()
      return Promise.resolve()
    }
    return cloud.pull()
      .then(() => this.refresh())
      .catch(() => {
        feedback.toast('云端同步失败，当前展示本地数据')
        this.refresh()
      })
  },

  refresh() {
    const data = store.getData()
    const today = dateUtil.today()
    const template = getTemplate(data.fastingPlan.templateId)
    const todayDiet = data.dietRecords.filter((item) => item.date === today)
    const todayExercise = data.exerciseRecords.filter((item) => item.date === today)
    const todayWater = data.waterRecords.filter((item) => item.date === today)
    const dietCalories = todayDiet.reduce((sum, item) => sum + Number(item.kcal || 0), 0)
    const exerciseCalories = todayExercise.reduce((sum, item) => sum + Number(item.kcal || 0), 0)
    const waterTotal = calc.totalWater(todayWater)
    const target = Number(data.settings.waterTarget || 2000)
    const waterProgress = Math.min(Math.round((waterTotal / target) * 100), 100)
    const timeline = calc.getFastingTimeline(data.fastingPlan)
    const fastingStatus = calc.getFastingStatus(data.fastingPlan)
    const checkedIn = data.fastingRecords.some((item) => item.date === today)

    this.setData({
      today,
      dateLabel: dateUtil.formatChineseDate(today),
      profile: data.profile,
      plan: data.fastingPlan,
      template,
      timeline,
      fastingStatus,
      planStatusText: data.fastingPlan.enabled
        ? '记录中'
        : (data.fastingPlan.stoppedAt ? '已停止' : '未设置'),
      planStopped: Boolean(!data.fastingPlan.enabled && data.fastingPlan.stoppedAt),
      checkedIn,
      waterTarget: target,
      waterTotal,
      waterProgress,
      waterReminder: Boolean(data.settings.waterReminder),
      waterRingStyle: `background: conic-gradient(#4c7fa3 0% ${waterProgress}%, #e8f2f8 ${waterProgress}% 100%);`,
      dietCalories,
      exerciseCalories,
      calorieDifference: dietCalories - exerciseCalories
    })

    this.updateCountdown()
  },

  updateCountdown() {
    const plan = this.data.plan || {}
    if (!plan.enabled || this.data.template.mode === 'weekly') {
      this.setData({
        countdown: this.data.template.mode === 'weekly' ? '按周计划' : '--:--:--'
      })
      return
    }
    const next = calc.getNextBoundary(plan)
    this.setData({ countdown: calc.formatCountdown(next.seconds) })
  },

  openFasting() {
    wx.navigateTo({
      url: '/pages/fasting-setup/index'
    })
  },

  handleFastingCheckin() {
    const data = store.getData()
    if (!data.consents.fastingRisk) {
      feedback.toast('请先阅读并确认健康风险提示')
      this.openFasting()
      return
    }
    if (!data.fastingPlan.enabled) {
      feedback.toast('请先保存断食计划')
      this.openFasting()
      return
    }
    if (this.data.checkedIn) {
      feedback.toast('今日已打卡')
      return
    }

    store.update((draft) => {
      draft.fastingRecords.push({
        id: createId('fast'),
        date: dateUtil.today(),
        templateId: draft.fastingPlan.templateId,
        eatStart: draft.fastingPlan.eatStart,
        eatEnd: draft.fastingPlan.eatEnd,
        completedAt: new Date().toISOString()
      })
    })
    this.refresh()
    cloud.push().catch(() => {})
    feedback.toast('今日断食打卡已记录', 'success')
  },

  stopFasting() {
    if (!this.data.plan.enabled) {
      return
    }
    feedback.confirm({
      title: '停止轻断食计划',
      content: '停止后首页不再显示断食倒计时，但历史打卡记录会完整保留。之后可随时重新启用计划。',
      confirmText: '停止计划',
      confirmColor: '#777777'
    }).then((confirmed) => {
      if (!confirmed) {
        return
      }
      store.update((draft) => {
        draft.fastingPlan.enabled = false
        draft.fastingPlan.stoppedAt = new Date().toISOString()
        draft.fastingPlan.updatedAt = new Date().toISOString()
      })
      this.refresh()
      cloud.push().catch(() => {})
      feedback.toast('轻断食计划已停止')
    })
  },

  addWater(event) {
    const amount = Number(event.currentTarget.dataset.amount)
    if (!amount) {
      return
    }
    store.update((draft) => {
      draft.waterRecords.push({
        id: createId('water'),
        date: dateUtil.today(),
        amount,
        time: dateUtil.formatTime(new Date())
      })
    })
    this.refresh()
    cloud.push().catch(() => {})
    feedback.toast(`已记录 ${amount}ml`, 'success')
  },

  editWaterTarget() {
    wx.showModal({
      title: '每日喝水目标',
      content: '请输入 1500 至 2500 之间的整数（ml）',
      editable: true,
      placeholderText: String(this.data.waterTarget),
      confirmText: '保存',
      confirmColor: '#2F7257',
      success: (result) => {
        if (!result.confirm) {
          return
        }
        const value = Number(result.content)
        if (!value || value < 1500 || value > 2500) {
          feedback.toast('请输入 1500 至 2500 之间的数值')
          return
        }
        store.update((draft) => {
          draft.settings.waterTarget = Math.round(value)
        })
        this.refresh()
        cloud.push().catch(() => {})
      }
    })
  },

  toggleWaterReminder(event) {
    const enabled = event.detail.value
    if (!enabled) {
      store.update((draft) => {
        draft.settings.waterReminder = false
      })
      this.setData({ waterReminder: false })
      cloud.push().catch(() => {})
      return
    }

    const templateId = config.subscriptionTemplates.water
    if (!templateId) {
      this.setData({ waterReminder: false })
      feedback.toast('请先在设置页配置喝水订阅消息模板')
      return
    }

    wx.requestSubscribeMessage({
      tmplIds: [templateId],
      success: (result) => {
        const accepted = result[templateId] === 'accept'
        store.update((draft) => {
          draft.settings.waterReminder = accepted
        })
        this.setData({ waterReminder: accepted })
        cloud.push().catch(() => {})
        feedback.toast(accepted ? '喝水提醒已开启' : '未获得订阅授权')
      },
      fail: () => {
        this.setData({ waterReminder: false })
        feedback.toast('订阅请求未完成')
      }
    })
  },

  goWaterHistory() {
    wx.navigateTo({
      url: '/pages/water-history/index'
    })
  },

  undoLastWater() {
    const today = dateUtil.today()
    const records = store.getData().waterRecords.filter((item) => item.date === today)
    if (!records.length) {
      feedback.toast('今日暂无喝水记录')
      return
    }
    const lastRecord = records[records.length - 1]
    feedback.confirm({
      title: '撤销喝水记录',
      content: `是否删除最近一次 ${lastRecord.amount}ml 的喝水记录？`
    }).then((confirmed) => {
      if (!confirmed) {
        return
      }
      store.update((draft) => {
        draft.waterRecords = draft.waterRecords.filter((item) => item.id !== lastRecord.id)
      })
      this.refresh()
      cloud.push().catch(() => {})
      feedback.toast('已撤销最近一次喝水记录')
    })
  },

  goRecords() {
    wx.switchTab({
      url: '/pages/records/index'
    })
  },

  goArticles() {
    wx.switchTab({
      url: '/pages/articles/index'
    })
  },

  goCalendar() {
    wx.navigateTo({
      url: '/pages/calendar/index'
    })
  }
})
