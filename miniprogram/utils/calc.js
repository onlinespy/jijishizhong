const { addDays, timeToMinutes } = require('./date')

function round(value, digits) {
  const factor = Math.pow(10, digits || 0)
  return Math.round(Number(value || 0) * factor) / factor
}

function calculateBMI(weight, height) {
  const kg = Number(weight)
  const cm = Number(height)
  if (!kg || !cm) {
    return null
  }
  return round(kg / Math.pow(cm / 100, 2), 1)
}

function calculateFoodCalories(food, amount, unit) {
  if (!food || !food.kcalPer100g || !amount) {
    return 0
  }

  const quantity = Number(amount)
  if (unit === '碗') {
    return Math.round((quantity * Number(food.bowlGram || 150) / 100) * food.kcalPer100g)
  }

  return Math.round((quantity / 100) * food.kcalPer100g)
}

function calculateExerciseCalories(met, weight, minutes) {
  if (!met || !weight || !minutes) {
    return 0
  }
  return Math.round(Number(met) * Number(weight) * (Number(minutes) / 60))
}

function getFastingTimeline(plan) {
  const eatStart = timeToMinutes(plan.eatStart || '12:00')
  const eatEnd = timeToMinutes(plan.eatEnd || '20:00')
  const eatingMinutes = eatEnd >= eatStart ? eatEnd - eatStart : 1440 - eatStart + eatEnd
  const fastingMinutes = 1440 - eatingMinutes

  return {
    eatStart,
    eatEnd,
    eatingMinutes,
    fastingMinutes,
    eatLeft: round((eatStart / 1440) * 100, 2),
    eatWidth: round((eatingMinutes / 1440) * 100, 2),
    fastingHours: round(fastingMinutes / 60, 1),
    eatingHours: round(eatingMinutes / 60, 1)
  }
}

function getFastingStatus(plan, date) {
  const now = date || new Date()
  const current = now.getHours() * 60 + now.getMinutes()
  const start = timeToMinutes(plan.eatStart || '12:00')
  const end = timeToMinutes(plan.eatEnd || '20:00')
  const inEatingWindow = start <= end
    ? current >= start && current < end
    : current >= start || current < end

  return {
    inEatingWindow,
    label: inEatingWindow ? '当前为进食窗口' : '当前为断食窗口',
    hint: inEatingWindow ? '本工具仅记录时间安排，不评价饮食内容' : '可正常饮水，如有不适请立即停止'
  }
}

function getNextBoundary(plan, date) {
  const now = date || new Date()
  const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
  const startSeconds = timeToMinutes(plan.eatStart || '12:00') * 60
  const endSeconds = timeToMinutes(plan.eatEnd || '20:00') * 60
  const inEatingWindow = startSeconds <= endSeconds
    ? currentSeconds >= startSeconds && currentSeconds < endSeconds
    : currentSeconds >= startSeconds || currentSeconds < endSeconds
  let targetSeconds = inEatingWindow ? endSeconds : startSeconds

  if (targetSeconds <= currentSeconds) {
    targetSeconds += 86400
  }

  return {
    label: inEatingWindow ? '距离进食窗口结束' : '距离进食窗口开始',
    seconds: targetSeconds - currentSeconds
  }
}

function formatCountdown(seconds) {
  const safe = Math.max(0, Number(seconds || 0))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const secs = safe % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function totalWater(records) {
  return (records || []).reduce((sum, item) => sum + Number(item.amount || 0), 0)
}

function averageCycle(periods) {
  const starts = (periods || [])
    .map((item) => item.start)
    .filter(Boolean)
    .sort()
  const gaps = []
  for (let index = 1; index < starts.length; index += 1) {
    const gap = Math.round((new Date(starts[index]).getTime() - new Date(starts[index - 1]).getTime()) / 86400000)
    if (gap >= 18 && gap <= 60) {
      gaps.push(gap)
    }
  }
  if (!gaps.length) {
    return 28
  }
  return Math.round(gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length)
}

function consecutiveDays(records, dateKey, getDate) {
  const keys = new Set((records || []).map(getDate).filter(Boolean))
  let cursor = dateKey
  let count = 0
  while (keys.has(cursor)) {
    count += 1
    cursor = addDays(cursor, -1)
  }
  return count
}

module.exports = {
  averageCycle,
  calculateBMI,
  calculateExerciseCalories,
  calculateFoodCalories,
  consecutiveDays,
  formatCountdown,
  getFastingStatus,
  getFastingTimeline,
  getNextBoundary,
  round,
  totalWater
}
