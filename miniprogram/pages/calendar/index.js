const store = require('../../utils/store')
const dateUtil = require('../../utils/date')
const calc = require('../../utils/calc')

Page({
  data: {
    monthValue: '',
    monthLabel: '',
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    cells: [],
    selectedDate: '',
    selectedLabel: '',
    selectedDetail: null,
    legend: [
      { type: 'fasting', name: '断食' },
      { type: 'water', name: '喝水' },
      { type: 'weight', name: '体重' },
      { type: 'period', name: '经期' }
    ]
  },

  onLoad() {
    const today = dateUtil.today()
    this.setData({
      monthValue: today.slice(0, 7) + '-01',
      selectedDate: today,
      selectedLabel: dateUtil.formatChineseDate(today)
    }, () => this.buildMonth())
  },

  onShow() {
    this.buildMonth()
  },

  previousMonth() {
    const date = dateUtil.toDate(this.data.monthValue)
    date.setMonth(date.getMonth() - 1, 1)
    this.setData({
      monthValue: dateUtil.formatDate(date)
    }, () => this.buildMonth())
  },

  nextMonth() {
    const date = dateUtil.toDate(this.data.monthValue)
    date.setMonth(date.getMonth() + 1, 1)
    this.setData({
      monthValue: dateUtil.formatDate(date)
    }, () => this.buildMonth())
  },

  selectDay(event) {
    const selectedDate = event.currentTarget.dataset.date
    if (!selectedDate) {
      return
    }
    this.setData({
      selectedDate,
      selectedLabel: dateUtil.formatChineseDate(selectedDate)
    }, () => this.buildSelectedDetail())
  },

  buildMonth() {
    const grid = dateUtil.monthGrid(this.data.monthValue)
    const markers = this.buildMarkerMap()
    const cells = grid.cells.map((cell) => {
      if (cell.blank) {
        return cell
      }
      return Object.assign({}, cell, {
        markers: markers[cell.date] || [],
        selected: cell.date === this.data.selectedDate
      })
    })
    this.setData({
      monthLabel: grid.label,
      cells
    }, () => this.buildSelectedDetail())
  },

  buildMarkerMap() {
    const data = store.getData()
    const map = {}

    function ensure(date) {
      if (!map[date]) {
        map[date] = []
      }
      return map[date]
    }

    function add(date, type) {
      const markers = ensure(date)
      if (markers.indexOf(type) === -1) {
        markers.push(type)
      }
    }

    data.fastingRecords.forEach((item) => add(item.date, 'fasting'))
    data.dietRecords.forEach((item) => add(item.date, 'diet'))
    data.exerciseRecords.forEach((item) => add(item.date, 'exercise'))
    data.weightRecords.forEach((item) => add(item.date, 'weight'))

    const waterDates = new Set(data.waterRecords.map((item) => item.date))
    waterDates.forEach((date) => add(date, 'water'))

    data.periodRecords.forEach((record) => {
      const days = dateUtil.diffDays(record.start, record.end)
      for (let index = 0; index <= days; index += 1) {
        add(dateUtil.addDays(record.start, index), 'period')
      }
    })

    return map
  },

  buildSelectedDetail() {
    const data = store.getData()
    const date = this.data.selectedDate
    const diet = data.dietRecords.filter((item) => item.date === date)
    const exercise = data.exerciseRecords.filter((item) => item.date === date)
    const water = data.waterRecords.filter((item) => item.date === date)
    const weight = data.weightRecords.find((item) => item.date === date)
    const fasting = data.fastingRecords.find((item) => item.date === date)
    const period = data.periodRecords.find((item) => date >= item.start && date <= item.end)
    const detail = {
      fasting,
      waterTotal: calc.totalWater(water),
      weight,
      dietCalories: diet.reduce((sum, item) => sum + Number(item.kcal || 0), 0),
      exerciseCalories: exercise.reduce((sum, item) => sum + Number(item.kcal || 0), 0),
      period,
      hasData: Boolean(fasting || water.length || weight || diet.length || exercise.length || period)
    }
    this.setData({ selectedDetail: detail })
  }
})
