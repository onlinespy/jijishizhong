const store = require('../../utils/store')
const { getBadgeState } = require('../../utils/badges')

Page({
  data: {
    badges: [],
    unlockedCount: 0
  },

  onShow() {
    const badges = getBadgeState(store.getData())
    this.setData({
      badges,
      unlockedCount: badges.filter((item) => item.unlocked).length
    })
  }
})
