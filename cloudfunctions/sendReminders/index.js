const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const COLLECTION = 'health_profiles'
const PAGE = 'pages/dashboard/index'
const PERIOD_PAGE = 'pages/records/index'

function pad(value) {
  return String(value).padStart(2, '0')
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function addDays(dateText, offset) {
  const parts = dateText.split('-').map(Number)
  const date = new Date(parts[0], parts[1] - 1, parts[2] + offset)
  return formatDate(date)
}

function averageCycle(periods) {
  const starts = (periods || []).map((item) => item.start).filter(Boolean).sort()
  const gaps = []
  for (let index = 1; index < starts.length; index += 1) {
    const previous = new Date(starts[index - 1]).getTime()
    const current = new Date(starts[index]).getTime()
    const days = Math.round((current - previous) / 86400000)
    if (days >= 18 && days <= 60) {
      gaps.push(days)
    }
  }
  return gaps.length ? Math.round(gaps.reduce((sum, value) => sum + value, 0) / gaps.length) : 28
}

async function sendWaterReminders() {
  const templateId = process.env.WATER_TEMPLATE_ID
  if (!templateId) {
    return { sent: 0, skipped: 'WATER_TEMPLATE_ID 未配置' }
  }

  const result = await db.collection(COLLECTION)
    .where({
      'settings.waterReminder': true
    })
    .limit(100)
    .get()
  let sent = 0

  for (const user of result.data) {
    try {
      await cloud.openapi.subscribeMessage.send({
        touser: user._openid,
        page: PAGE,
        lang: 'zh_CN',
        templateId,
        miniprogramState: 'formal',
        data: {
          thing1: { value: '请记得按自己的节奏补充水分' },
          time2: { value: new Date().toLocaleString('zh-CN', { hour12: false }) }
        }
      })
      sent += 1
      await db.collection(COLLECTION).doc(user._id).update({
        data: {
          'settings.waterReminder': false,
          'settings.waterReminderLastSentAt': db.serverDate()
        }
      })
    } catch (error) {
      console.error('water reminder failed', user._openid, error)
    }
  }
  return { sent }
}

async function sendPeriodReminders() {
  const templateId = process.env.PERIOD_TEMPLATE_ID
  if (!templateId) {
    return { sent: 0, skipped: 'PERIOD_TEMPLATE_ID 未配置' }
  }

  const result = await db.collection(COLLECTION)
    .where({
      'settings.periodReminder': true
    })
    .limit(100)
    .get()
  const today = formatDate(new Date())
  let sent = 0

  for (const user of result.data) {
    const periods = Array.isArray(user.periodRecords) ? user.periodRecords : []
    if (!periods.length) {
      continue
    }
    const sorted = periods.slice().sort((a, b) => a.start.localeCompare(b.start))
    const latest = sorted[sorted.length - 1]
    const nextStart = addDays(latest.start, averageCycle(sorted))
    const reminderDate = addDays(nextStart, -2)

    if (today !== reminderDate) {
      continue
    }

    try {
      await cloud.openapi.subscribeMessage.send({
        touser: user._openid,
        page: PERIOD_PAGE,
        lang: 'zh_CN',
        templateId,
        miniprogramState: 'formal',
        data: {
          date1: { value: nextStart },
          thing2: { value: '经期日期为历史记录简单估算，仅供记录参考' }
        }
      })
      sent += 1
      await db.collection(COLLECTION).doc(user._id).update({
        data: {
          'settings.periodReminder': false,
          'settings.periodReminderLastSentAt': db.serverDate()
        }
      })
    } catch (error) {
      console.error('period reminder failed', user._openid, error)
    }
  }
  return { sent }
}

exports.main = async (event) => {
  const triggerName = event && event.TriggerName ? event.TriggerName : ''
  if (triggerName === 'water-reminder') {
    return sendWaterReminders()
  }
  if (triggerName === 'period-reminder') {
    return sendPeriodReminders()
  }

  const water = await sendWaterReminders()
  const period = await sendPeriodReminders()
  return {
    ok: true,
    water,
    period
  }
}
