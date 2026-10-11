const store = require('../../utils/store')
const cloud = require('../../utils/cloud')
const feedback = require('../../utils/feedback')
const dateUtil = require('../../utils/date')
const calc = require('../../utils/calc')
const { createId } = require('../../utils/id')
const { FOOD_GROUPS, findFood } = require('../../data/food-library')
const { EXERCISE_LIBRARY, getExercise } = require('../../data/exercise-library')

const MEAL_TYPES = ['早餐', '午餐', '晚餐', '加餐']
const ALL_FOODS = FOOD_GROUPS.reduce((items, group) => {
  return items.concat(group.foods.map((food) => Object.assign({
    groupId: group.id,
    groupName: group.name
  }, food)))
}, [])

Page({
  data: {
    activeTab: 'diet',
    tabs: [
      { id: 'diet', name: '饮食' },
      { id: 'exercise', name: '运动' }
    ],
    showPeriodEntry: true,
    selectedDate: '',
    selectedDateLabel: '',
    profile: {},

    mealTypes: MEAL_TYPES,
    activeMeal: '早餐',
    dietMode: 'library',
    foodGroups: FOOD_GROUPS,
    activeFoodGroup: FOOD_GROUPS[0].id,
    visibleFoods: FOOD_GROUPS[0].foods,
    foodSearch: '',
    selectedFood: null,
    foodAmount: '',
    foodUnit: '克',
    foodUnits: ['克', '碗'],
    foodPreviewKcal: 0,
    manualName: '',
    manualAmount: '',
    manualUnit: '份',
    manualKcal: '',
    dietRecords: [],
    dietTotal: 0,

    exerciseModes: [
      { id: 'library', name: '基础运动库' },
      { id: 'custom', name: '自定义运动' }
    ],
    exerciseMode: 'library',
    exerciseLibrary: EXERCISE_LIBRARY,
    selectedExerciseId: EXERCISE_LIBRARY[0].id,
    selectedExercise: EXERCISE_LIBRARY[0],
    exerciseDuration: '',
    exercisePreviewKcal: 0,
    customExerciseName: '',
    customExerciseDuration: '',
    customExerciseKcal: '',
    exerciseRecords: [],
    exerciseTotal: 0,

    weightInput: '',
    weightBmi: null,
    weightRecords: [],
    weightChartMeta: '',

    periodStart: '',
    periodEnd: '',
    periodRecords: [],
    periodPrediction: null
  },

  onLoad() {
    const today = dateUtil.today()
    this.setData({
      selectedDate: today,
      selectedDateLabel: dateUtil.formatChineseDate(today),
      periodStart: today,
      periodEnd: today,
      weightInput: ''
    })
  },

  onShow() {
    this.syncTabBar()
    this.refresh()
  },

  syncTabBar() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
  },

  onReady() {
    this.canvasReady = true
    if (this.data.activeTab === 'weight') {
      this.drawWeightChart()
    }
  },

  refresh() {
    const data = store.getData()
    const tabs = this.data.tabs.filter((item) => item.id !== 'period' || !data.profile.hidePeriod)
    let activeTab = this.data.activeTab
    if (activeTab === 'period' && data.profile.hidePeriod) {
      activeTab = 'diet'
    }

    const dietRecords = data.dietRecords
      .filter((item) => item.date === this.data.selectedDate)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    const exerciseRecords = data.exerciseRecords
      .filter((item) => item.date === this.data.selectedDate)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    const weightRecords = data.weightRecords
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
    const latestWeight = weightRecords[0]

    this.setData({
      tabs,
      activeTab,
      showPeriodEntry: !data.profile.hidePeriod,
      profile: data.profile,
      dietRecords,
      dietTotal: dietRecords.reduce((sum, item) => sum + Number(item.kcal || 0), 0),
      exerciseRecords,
      exerciseTotal: exerciseRecords.reduce((sum, item) => sum + Number(item.kcal || 0), 0),
      weightRecords,
      weightBmi: calc.calculateBMI(latestWeight && latestWeight.weight, data.profile.height),
      periodRecords: data.periodRecords
        .slice()
        .sort((a, b) => b.start.localeCompare(a.start))
        .map((item) => Object.assign({}, item, {
          days: dateUtil.diffDays(item.start, item.end) + 1
        })),
      periodPrediction: this.getPeriodPrediction(data.periodRecords)
    }, () => {
      if (activeTab === 'weight') {
        this.drawWeightChart()
      }
    })
  },

  switchTab(event) {
    const activeTab = event.currentTarget.dataset.tab
    this.setData({ activeTab }, () => {
      if (activeTab === 'weight') {
        this.drawWeightChart()
      }
    })
  },

  changeSelectedDate(event) {
    const selectedDate = event.detail.value
    this.setData({
      selectedDate,
      selectedDateLabel: dateUtil.formatChineseDate(selectedDate)
    }, () => this.refresh())
  },

  selectMeal(event) {
    this.setData({ activeMeal: event.currentTarget.dataset.value })
  },

  changeDietMode(event) {
    this.setData({ dietMode: event.currentTarget.dataset.value })
  },

  selectFoodGroup(event) {
    const groupId = event.currentTarget.dataset.id
    const group = FOOD_GROUPS.find((item) => item.id === groupId)
    this.setData({
      activeFoodGroup: groupId,
      foodSearch: '',
      visibleFoods: group ? group.foods : [],
      selectedFood: null,
      foodAmount: '',
      foodUnit: '克',
      foodUnits: ['克'],
      foodPreviewKcal: 0
    })
  },

  onFoodSearchInput(event) {
    const foodSearch = event.detail.value
    const keyword = String(foodSearch || '').trim().toLowerCase()
    const visibleFoods = keyword
      ? ALL_FOODS.filter((food) => food.name.toLowerCase().indexOf(keyword) !== -1)
      : (FOOD_GROUPS.find((item) => item.id === this.data.activeFoodGroup) || FOOD_GROUPS[0]).foods
    this.setData({
      foodSearch,
      visibleFoods
    })
  },

  copyYesterdayDiet() {
    const yesterday = dateUtil.addDays(this.data.selectedDate, -1)
    const records = store.getData().dietRecords.filter((item) => item.date === yesterday)
    if (!records.length) {
      feedback.toast('昨日暂无饮食记录')
      return
    }
    feedback.confirm({
      title: '复制昨日饮食',
      content: `将 ${records.length} 条记录复制到 ${this.data.selectedDate}，是否继续？`
    }).then((confirmed) => {
      if (!confirmed) {
        return
      }
      store.update((draft) => {
        records.forEach((record) => {
          draft.dietRecords.push(Object.assign({}, record, {
            id: createId('diet'),
            date: this.data.selectedDate,
            createdAt: new Date().toISOString()
          }))
        })
      })
      this.afterRecordSaved('昨日饮食已复制')
    })
  },

  selectFood(event) {
    const food = findFood(event.currentTarget.dataset.id)
    if (!food) {
      return
    }
    const units = ['克', '碗']
    this.setData({
      selectedFood: food,
      foodUnit: '克',
      foodUnits: units,
      foodPreviewKcal: food.bowlGram
        ? calc.calculateFoodCalories(food, 1, '碗')
        : Math.round(food.kcalPer100g)
    })
  },

  onFoodAmountInput(event) {
    const foodAmount = event.detail.value
    this.setData({ foodAmount }, () => this.updateFoodPreview())
  },

  selectFoodUnit(event) {
    this.setData({ foodUnit: event.currentTarget.dataset.value }, () => this.updateFoodPreview())
  },

  updateFoodPreview() {
    const food = this.data.selectedFood
    const amount = Number(this.data.foodAmount || 0)
    const foodPreviewKcal = food
      ? calc.calculateFoodCalories(food, amount, this.data.foodUnit)
      : 0
    this.setData({ foodPreviewKcal })
  },

  onManualInput(event) {
    const field = event.currentTarget.dataset.field
    this.setData({
      [field]: event.detail.value
    })
  },

  saveDiet() {
    if (this.data.dietMode === 'library') {
      this.saveLibraryDiet()
      return
    }
    this.saveManualDiet()
  },

  saveLibraryDiet() {
    const food = this.data.selectedFood
    const amount = Number(this.data.foodAmount)
    if (!food) {
      feedback.toast('请先选择食物')
      return
    }
    if (!amount || amount <= 0) {
      feedback.toast('请输入有效食用量')
      return
    }
    const kcal = calc.calculateFoodCalories(food, amount, this.data.foodUnit)
    store.update((draft) => {
      draft.dietRecords.push({
        id: createId('diet'),
        date: this.data.selectedDate,
        mealType: this.data.activeMeal,
        name: food.name,
        amount,
        unit: this.data.foodUnit,
        kcal,
        source: 'food-library',
        createdAt: new Date().toISOString()
      })
    })
    this.setData({
      foodAmount: '',
      foodPreviewKcal: 0
    })
    this.afterRecordSaved('饮食记录已保存')
  },

  saveManualDiet() {
    const name = String(this.data.manualName || '').trim()
    const kcal = Number(this.data.manualKcal)
    if (!name) {
      feedback.toast('请输入食物名称')
      return
    }
    if (!kcal || kcal < 0) {
      feedback.toast('请输入参考热量')
      return
    }
    store.update((draft) => {
      draft.dietRecords.push({
        id: createId('diet'),
        date: this.data.selectedDate,
        mealType: this.data.activeMeal,
        name,
        amount: Number(this.data.manualAmount || 0),
        unit: this.data.manualUnit || '份',
        kcal: Math.round(kcal),
        source: 'manual',
        createdAt: new Date().toISOString()
      })
    })
    this.setData({
      manualName: '',
      manualAmount: '',
      manualKcal: ''
    })
    this.afterRecordSaved('饮食记录已保存')
  },

  changeExerciseMode(event) {
    this.setData({ exerciseMode: event.currentTarget.dataset.value })
  },

  selectExercise(event) {
    const selectedExercise = getExercise(event.currentTarget.dataset.id)
    this.setData({
      selectedExerciseId: selectedExercise.id,
      selectedExercise
    }, () => this.updateExercisePreview())
  },

  onExerciseDurationInput(event) {
    this.setData({ exerciseDuration: event.detail.value }, () => this.updateExercisePreview())
  },

  updateExercisePreview() {
    const exercisePreviewKcal = calc.calculateExerciseCalories(
      this.data.selectedExercise.met,
      this.data.profile.weight,
      Number(this.data.exerciseDuration || 0)
    )
    this.setData({ exercisePreviewKcal })
  },

  saveExercise() {
    if (this.data.exerciseMode === 'custom') {
      this.saveCustomExercise()
      return
    }

    const duration = Number(this.data.exerciseDuration)
    if (!this.data.profile.weight) {
      feedback.toast('请先在“我的”中填写体重')
      return
    }
    if (!duration || duration <= 0) {
      feedback.toast('请输入运动时长')
      return
    }
    const kcal = calc.calculateExerciseCalories(
      this.data.selectedExercise.met,
      this.data.profile.weight,
      duration
    )
    store.update((draft) => {
      draft.exerciseRecords.push({
        id: createId('exercise'),
        date: this.data.selectedDate,
        name: this.data.selectedExercise.name,
        duration,
        kcal,
        weight: Number(this.data.profile.weight),
        source: 'exercise-library',
        createdAt: new Date().toISOString()
      })
    })
    this.setData({
      exerciseDuration: '',
      exercisePreviewKcal: 0
    })
    this.afterRecordSaved('运动记录已保存')
  },

  saveCustomExercise() {
    const name = String(this.data.customExerciseName || '').trim()
    const duration = Number(this.data.customExerciseDuration)
    const kcal = Number(this.data.customExerciseKcal)
    if (!name) {
      feedback.toast('请输入运动名称')
      return
    }
    if (!duration || duration <= 0) {
      feedback.toast('请输入运动时长')
      return
    }
    if (!kcal || kcal < 0) {
      feedback.toast('请输入参考消耗热量')
      return
    }
    store.update((draft) => {
      draft.exerciseRecords.push({
        id: createId('exercise'),
        date: this.data.selectedDate,
        name,
        duration,
        kcal: Math.round(kcal),
        source: 'manual',
        createdAt: new Date().toISOString()
      })
    })
    this.setData({
      customExerciseName: '',
      customExerciseDuration: '',
      customExerciseKcal: ''
    })
    this.afterRecordSaved('自定义运动已保存')
  },

  onWeightInput(event) {
    this.setData({ weightInput: event.detail.value })
  },

  saveWeight() {
    const weight = Number(this.data.weightInput)
    if (!weight || weight < 20 || weight > 300) {
      feedback.toast('请输入 20 至 300 之间的体重')
      return
    }

    store.update((draft) => {
      const existing = draft.weightRecords.find((item) => item.date === this.data.selectedDate)
      if (existing) {
        existing.weight = weight
        existing.updatedAt = new Date().toISOString()
      } else {
        draft.weightRecords.push({
          id: createId('weight'),
          date: this.data.selectedDate,
          weight,
          createdAt: new Date().toISOString()
        })
      }
      draft.profile.weight = weight
    })
    this.setData({ weightInput: '' })
    this.afterRecordSaved('体重记录已保存')
  },

  drawWeightChart() {
    if (!this.canvasReady) {
      return
    }

    const records = this.data.weightRecords.slice(0, 14).reverse()
    wx.createSelectorQuery()
      .in(this)
      .select('#weightTrend')
      .fields({ node: true, size: true })
      .exec((result) => {
        const canvasInfo = result && result[0]
        if (!canvasInfo || !canvasInfo.node || !records.length) {
          this.setData({ weightChartMeta: records.length ? '' : '记录体重后显示趋势' })
          return
        }
        const canvas = canvasInfo.node
        const context = canvas.getContext('2d')
        const pixelRatio = wx.getWindowInfo ? wx.getWindowInfo().pixelRatio : 2
        const width = canvasInfo.width
        const height = canvasInfo.height
        canvas.width = width * pixelRatio
        canvas.height = height * pixelRatio
        context.scale(pixelRatio, pixelRatio)

        const padding = { left: 20, right: 16, top: 18, bottom: 26 }
        const chartWidth = width - padding.left - padding.right
        const chartHeight = height - padding.top - padding.bottom
        const values = records.map((item) => Number(item.weight))
        const min = Math.min.apply(null, values)
        const max = Math.max.apply(null, values)
        const range = max - min || 1

        context.clearRect(0, 0, width, height)
        context.strokeStyle = '#eeeeee'
        context.lineWidth = 1
        for (let line = 0; line < 3; line += 1) {
          const y = padding.top + (chartHeight / 2) * line
          context.beginPath()
          context.moveTo(padding.left, y)
          context.lineTo(width - padding.right, y)
          context.stroke()
        }

        const points = records.map((item, index) => {
          const x = padding.left + (records.length === 1 ? chartWidth / 2 : (chartWidth * index) / (records.length - 1))
          const y = padding.top + chartHeight - ((Number(item.weight) - min) / range) * chartHeight
          return { x, y }
        })

        context.strokeStyle = '#2f7257'
        context.lineWidth = 2
        context.lineJoin = 'round'
        context.beginPath()
        points.forEach((point, index) => {
          if (index === 0) {
            context.moveTo(point.x, point.y)
          } else {
            context.lineTo(point.x, point.y)
          }
        })
        context.stroke()

        context.fillStyle = '#ffffff'
        context.strokeStyle = '#2f7257'
        context.lineWidth = 2
        points.forEach((point) => {
          context.beginPath()
          context.arc(point.x, point.y, 3.5, 0, Math.PI * 2)
          context.fill()
          context.stroke()
        })

        context.fillStyle = '#999999'
        context.font = '10px sans-serif'
        context.textAlign = 'left'
        context.fillText(`${min}kg`, 2, height - 8)
        context.textAlign = 'right'
        context.fillText(`${max}kg`, width - 2, 14)

        this.setData({
          weightChartMeta: `${records[0].date} 至 ${records[records.length - 1].date}`
        })
      })
  },

  onPeriodStartChange(event) {
    const periodStart = event.detail.value
    const periodEnd = this.data.periodEnd < periodStart ? periodStart : this.data.periodEnd
    this.setData({ periodStart, periodEnd })
  },

  onPeriodEndChange(event) {
    const periodEnd = event.detail.value
    if (periodEnd < this.data.periodStart) {
      feedback.toast('结束日期不能早于开始日期')
      return
    }
    this.setData({ periodEnd })
  },

  savePeriod() {
    if (!this.data.periodStart || !this.data.periodEnd) {
      feedback.toast('请选择经期日期')
      return
    }
    store.update((draft) => {
      draft.periodRecords.push({
        id: createId('period'),
        start: this.data.periodStart,
        end: this.data.periodEnd,
        createdAt: new Date().toISOString()
      })
    })
    this.afterRecordSaved('经期记录已保存')
  },

  hidePeriod() {
    feedback.confirm({
      title: '隐藏经期模块',
      content: '隐藏后记录页不再显示经期入口，可在“我的-编辑档案”中重新开启。'
    }).then((confirmed) => {
      if (!confirmed) {
        return
      }
      store.update((draft) => {
        draft.profile.hidePeriod = true
      })
      this.setData({ activeTab: 'diet' }, () => this.refresh())
      cloud.push().catch(() => {})
    })
  },

  getPeriodPrediction(periods) {
    if (!periods.length) {
      return null
    }
    const sorted = periods.slice().sort((a, b) => a.start.localeCompare(b.start))
    const latest = sorted[sorted.length - 1]
    const cycleLength = calc.averageCycle(sorted)
    const nextStart = dateUtil.addDays(latest.start, cycleLength)
    const ovulation = dateUtil.addDays(nextStart, -14)
    return {
      cycleLength,
      nextStart,
      nextStartLabel: dateUtil.formatChineseDate(nextStart),
      ovulation,
      ovulationLabel: dateUtil.formatChineseDate(ovulation),
      fertileStart: dateUtil.addDays(ovulation, -5),
      fertileEnd: dateUtil.addDays(ovulation, 1)
    }
  },

  deleteRecord(event) {
    const collection = event.currentTarget.dataset.collection
    const id = event.currentTarget.dataset.id
    if (!collection || !id) {
      return
    }
    feedback.confirm({
      title: '删除记录',
      content: '删除后无法恢复，是否继续？',
      confirmText: '删除',
      confirmColor: '#777777'
    }).then((confirmed) => {
      if (!confirmed) {
        return
      }
      store.update((draft) => {
        draft[collection] = draft[collection].filter((item) => item.id !== id)
      })
      this.refresh()
      cloud.push().catch(() => {})
      feedback.toast('已删除')
    })
  },

  afterRecordSaved(message) {
    this.refresh()
    cloud.push().catch(() => {})
    feedback.toast(message, 'success')
  }
})
