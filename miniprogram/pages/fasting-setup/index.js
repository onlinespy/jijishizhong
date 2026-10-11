const store = require('../../utils/store')
const cloud = require('../../utils/cloud')
const feedback = require('../../utils/feedback')
const calc = require('../../utils/calc')
const { FASTING_TEMPLATES, getTemplate } = require('../../data/fasting')

Page({
  data: {
    riskModalVisible: false,
    riskAgreed: false,
    templates: FASTING_TEMPLATES,
    selectedTemplateId: '16-8',
    selectedTemplate: FASTING_TEMPLATES[0],
    eatStart: '12:00',
    eatEnd: '20:00',
    timeline: {},
    planEnabled: false,
    planStopped: false
  },

  onLoad() {
    const data = store.getData()
    const selectedTemplate = getTemplate(data.fastingPlan.templateId)
    this.setData({
      riskModalVisible: !data.consents.fastingRisk,
      selectedTemplateId: selectedTemplate.id,
      selectedTemplate,
      eatStart: data.fastingPlan.eatStart || selectedTemplate.defaultEatStart,
      eatEnd: data.fastingPlan.eatEnd || selectedTemplate.defaultEatEnd,
      planEnabled: Boolean(data.fastingPlan.enabled),
      planStopped: Boolean(!data.fastingPlan.enabled && data.fastingPlan.stoppedAt)
    }, () => this.updatePreview())
  },

  toggleRiskAgreement() {
    this.setData({ riskAgreed: !this.data.riskAgreed })
  },

  agreeRisk() {
    if (!this.data.riskAgreed) {
      feedback.toast('请先勾选已阅读并理解')
      return
    }
    store.update((draft) => {
      draft.consents.fastingRisk = true
    })
    this.setData({ riskModalVisible: false })
    cloud.push().catch(() => {})
  },

  selectTemplate(event) {
    const selectedTemplate = getTemplate(event.currentTarget.dataset.id)
    this.setData({
      selectedTemplateId: selectedTemplate.id,
      selectedTemplate,
      eatStart: selectedTemplate.defaultEatStart,
      eatEnd: selectedTemplate.defaultEatEnd
    }, () => this.updatePreview())
  },

  onEatStartChange(event) {
    this.setData({ eatStart: event.detail.value }, () => this.updatePreview())
  },

  onEatEndChange(event) {
    this.setData({ eatEnd: event.detail.value }, () => this.updatePreview())
  },

  updatePreview() {
    const timeline = calc.getFastingTimeline({
      eatStart: this.data.eatStart,
      eatEnd: this.data.eatEnd
    })
    this.setData({ timeline })
  },

  resetTimes() {
    const template = this.data.selectedTemplate
    this.setData({
      eatStart: template.defaultEatStart,
      eatEnd: template.defaultEatEnd
    }, () => this.updatePreview())
  },

  savePlan() {
    const data = store.getData()
    if (!data.consents.fastingRisk) {
      this.setData({ riskModalVisible: true })
      return
    }
    if (this.data.selectedTemplate.mode === 'daily' && this.data.eatStart === this.data.eatEnd) {
      feedback.toast('进食开始与结束时间不能相同')
      return
    }

    store.update((draft) => {
      draft.fastingPlan = {
        enabled: true,
        templateId: this.data.selectedTemplateId,
        eatStart: this.data.eatStart,
        eatEnd: this.data.eatEnd,
        stoppedAt: '',
        updatedAt: new Date().toISOString()
      }
    })
    cloud.push().catch(() => {})
    feedback.toast('断食计划已保存', 'success')
    setTimeout(() => wx.navigateBack(), 700)
  },

  stopPlan() {
    feedback.confirm({
      title: '停止轻断食计划',
      content: '停止后不再显示断食倒计时和每日打卡按钮，历史记录仍会保留，可稍后重新启用。',
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
      this.setData({
        planEnabled: false,
        planStopped: true
      })
      cloud.push().catch(() => {})
      feedback.toast('轻断食计划已停止')
      setTimeout(() => wx.navigateBack(), 700)
    })
  }
})
