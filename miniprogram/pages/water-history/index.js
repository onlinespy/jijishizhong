const store = require('../../utils/store')
const cloud = require('../../utils/cloud')
const feedback = require('../../utils/feedback')
const dateUtil = require('../../utils/date')
const calc = require('../../utils/calc')

Page({
  data: {
    groups: [],
    waterTarget: 2000
  },

  onShow() {
    const data = store.getData()
    const map = {}
    data.waterRecords.forEach((item) => {
      if (!map[item.date]) {
        map[item.date] = []
      }
      map[item.date].push(item)
    })
    const groups = Object.keys(map)
      .sort((a, b) => b.localeCompare(a))
      .map((date) => ({
        date,
        label: dateUtil.formatChineseDate(date),
        total: calc.totalWater(map[date]),
        items: map[date].sort((a, b) => String(a.time).localeCompare(String(b.time)))
      }))

    this.setData({
      groups,
      waterTarget: Number(data.settings.waterTarget || 2000)
    })
  },

  deleteWater(event) {
    const id = event.currentTarget.dataset.id
    const amount = event.currentTarget.dataset.amount
    feedback.confirm({
      title: '删除喝水记录',
      content: `是否删除这条 ${amount}ml 的喝水记录？`
    }).then((confirmed) => {
      if (!confirmed) {
        return
      }
      store.update((draft) => {
        draft.waterRecords = draft.waterRecords.filter((item) => item.id !== id)
      })
      this.onShow()
      cloud.push().catch(() => {})
      feedback.toast('喝水记录已删除')
    })
  }
})
