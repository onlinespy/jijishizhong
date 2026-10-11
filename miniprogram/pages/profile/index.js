const store = require('../../utils/store')
const calc = require('../../utils/calc')
const { getBadgeState } = require('../../utils/badges')

Page({
  data: {
    profile: {},
    bmi: null,
    latestWeight: '--',
    recordDayCount: 0,
    unlockedCount: 0,
    badgeTotal: 0,
    menus: [
      { id: 'edit', symbol: '档', title: '个人健康档案', note: '身高、体重、性别、生日', theme: 'green' },
      { id: 'calendar', symbol: '历', title: '综合打卡日历', note: '回看断食、喝水、体重等记录', theme: 'blue' },
      { id: 'badges', symbol: '章', title: '勋章墙', note: '连续记录成就展示', theme: 'gold' },
      { id: 'settings', symbol: '设', title: '设置', note: '订阅提醒与数据清理', theme: 'purple' },
      { id: 'privacy', symbol: '隐', title: '隐私政策', note: '了解数据收集与使用方式', theme: 'gray' },
      { id: 'disclaimer', symbol: '免', title: '全局免责声明', note: '产品功能与使用边界说明', theme: 'gray' }
    ]
  },

  onShow() {
    this.syncTabBar()
    this.refresh()
  },

  syncTabBar() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 })
    }
  },

  refresh() {
    const data = store.getData()
    const weights = data.weightRecords.slice().sort((a, b) => b.date.localeCompare(a.date))
    const badges = getBadgeState(data)
    const recordDays = new Set()
    ;[
      data.fastingRecords,
      data.dietRecords,
      data.exerciseRecords,
      data.weightRecords,
      data.waterRecords
    ].forEach((records) => records.forEach((item) => recordDays.add(item.date)))

    this.setData({
      profile: data.profile,
      bmi: calc.calculateBMI((weights[0] && weights[0].weight) || data.profile.weight, data.profile.height),
      latestWeight: (weights[0] && weights[0].weight) || data.profile.weight || '--',
      recordDayCount: recordDays.size,
      unlockedCount: badges.filter((item) => item.unlocked).length,
      badgeTotal: badges.length
    })
  },

  openMenu(event) {
    const id = event.currentTarget.dataset.id
    if (id === 'edit') {
      wx.navigateTo({ url: '/pages/profile-edit/index' })
      return
    }
    if (id === 'calendar') {
      wx.navigateTo({ url: '/pages/calendar/index' })
      return
    }
    if (id === 'badges') {
      wx.navigateTo({ url: '/pages/badges/index' })
      return
    }
    if (id === 'settings') {
      wx.navigateTo({ url: '/pages/settings/index' })
      return
    }
    wx.navigateTo({ url: `/pages/agreement/index?type=${id}` })
  }
})
