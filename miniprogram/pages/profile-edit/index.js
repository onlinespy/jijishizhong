const store = require('../../utils/store')
const cloud = require('../../utils/cloud')
const feedback = require('../../utils/feedback')
const calc = require('../../utils/calc')

Page({
  data: {
    nickname: '',
    gender: '未设置',
    genders: ['未设置', '女', '男'],
    birthday: '',
    height: '',
    weight: '',
    hidePeriod: false,
    bmi: null
  },

  onLoad() {
    const profile = store.getData().profile
    this.setData({
      nickname: profile.nickname || '',
      gender: profile.gender || '未设置',
      birthday: profile.birthday || '',
      height: profile.height || '',
      weight: profile.weight || '',
      hidePeriod: Boolean(profile.hidePeriod)
    }, () => this.updateBMI())
  },

  onInput(event) {
    const field = event.currentTarget.dataset.field
    this.setData({ [field]: event.detail.value }, () => {
      if (field === 'height' || field === 'weight') {
        this.updateBMI()
      }
    })
  },

  selectGender(event) {
    this.setData({ gender: event.currentTarget.dataset.value })
  },

  onBirthdayChange(event) {
    this.setData({ birthday: event.detail.value })
  },

  onHidePeriodChange(event) {
    this.setData({ hidePeriod: event.detail.value })
  },

  updateBMI() {
    this.setData({
      bmi: calc.calculateBMI(this.data.weight, this.data.height)
    })
  },

  save() {
    const height = Number(this.data.height)
    const weight = Number(this.data.weight)
    if (this.data.height && (height < 80 || height > 250)) {
      feedback.toast('请输入 80 至 250cm 之间的身高')
      return
    }
    if (this.data.weight && (weight < 20 || weight > 300)) {
      feedback.toast('请输入 20 至 300kg 之间的体重')
      return
    }

    store.update((draft) => {
      draft.profile = {
        nickname: String(this.data.nickname || '').trim(),
        gender: this.data.gender,
        birthday: this.data.birthday,
        height: height || null,
        weight: weight || draft.profile.weight || null,
        hidePeriod: Boolean(this.data.hidePeriod)
      }
    })
    cloud.push().catch(() => {})
    feedback.toast('档案已保存', 'success')
    setTimeout(() => wx.navigateBack(), 650)
  }
})
