const config = require('../config/index')

function defaultData() {
  return {
    schemaVersion: 1,
    profile: {
      nickname: '',
      gender: '未设置',
      birthday: '',
      height: null,
      weight: null,
      hidePeriod: false
    },
    consents: {
      fastingRisk: false,
      privacyViewed: false
    },
    fastingPlan: {
      enabled: false,
      templateId: '16-8',
      eatStart: '12:00',
      eatEnd: '20:00',
      updatedAt: ''
    },
    fastingRecords: [],
    dietRecords: [],
    exerciseRecords: [],
    weightRecords: [],
    waterRecords: [],
    periodRecords: [],
    settings: {
      waterTarget: 2000,
      waterReminder: false,
      periodReminder: false
    },
    meta: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }
}

function cleanRecordDefaults(data) {
  const fallback = defaultData()
  const merged = Object.assign({}, fallback, data || {})
  merged.profile = Object.assign({}, fallback.profile, (data && data.profile) || {})
  merged.consents = Object.assign({}, fallback.consents, (data && data.consents) || {})
  merged.fastingPlan = Object.assign({}, fallback.fastingPlan, (data && data.fastingPlan) || {})
  merged.settings = Object.assign({}, fallback.settings, (data && data.settings) || {})
  merged.meta = Object.assign({}, fallback.meta, (data && data.meta) || {})
  merged.fastingRecords = Array.isArray(merged.fastingRecords) ? merged.fastingRecords : []
  merged.dietRecords = Array.isArray(merged.dietRecords) ? merged.dietRecords : []
  merged.exerciseRecords = Array.isArray(merged.exerciseRecords) ? merged.exerciseRecords : []
  merged.weightRecords = Array.isArray(merged.weightRecords) ? merged.weightRecords : []
  merged.waterRecords = Array.isArray(merged.waterRecords) ? merged.waterRecords : []
  merged.periodRecords = Array.isArray(merged.periodRecords) ? merged.periodRecords : []
  return merged
}

function ensureInitialized() {
  const existing = wx.getStorageSync(config.storageKey)
  if (!existing) {
    save(defaultData())
    return getData()
  }
  return cleanRecordDefaults(existing)
}

function getData() {
  const existing = wx.getStorageSync(config.storageKey)
  return cleanRecordDefaults(existing)
}

function save(data) {
  const normalized = cleanRecordDefaults(data)
  normalized.meta.updatedAt = new Date().toISOString()
  wx.setStorageSync(config.storageKey, normalized)
  return normalized
}

function update(mutator) {
  const current = getData()
  mutator(current)
  return save(current)
}

function getRecordsByDate(collection, date) {
  return getData()[collection].filter((item) => item.date === date)
}

function resetRecords() {
  return update((data) => {
    data.fastingRecords = []
    data.dietRecords = []
    data.exerciseRecords = []
    data.weightRecords = []
    data.waterRecords = []
    data.periodRecords = []
  })
}

function replaceAll(data) {
  return save(data)
}

module.exports = {
  defaultData,
  ensureInitialized,
  getData,
  getRecordsByDate,
  replaceAll,
  resetRecords,
  save,
  update
}
