const { consecutiveDays, totalWater } = require('./calc')
const { addDays, today } = require('./date')

const DEFINITIONS = [
  {
    id: 'fasting-3',
    name: '习惯起步',
    description: '连续断食打卡 3 天',
    symbol: '3',
    theme: 'green'
  },
  {
    id: 'fasting-7',
    name: '一周坚持',
    description: '连续断食打卡 7 天',
    symbol: '7',
    theme: 'gold'
  },
  {
    id: 'fasting-21',
    name: '稳定记录',
    description: '连续断食打卡 21 天',
    symbol: '21',
    theme: 'blue'
  },
  {
    id: 'water-7',
    name: '规律饮水',
    description: '连续喝水打卡 7 天',
    symbol: '水',
    theme: 'cyan'
  },
  {
    id: 'weight-4',
    name: '体重观察',
    description: '完成 4 次体重记录',
    symbol: '秤',
    theme: 'purple'
  },
  {
    id: 'checkin-30',
    name: '记录达人',
    description: '累计完成 30 次健康打卡',
    symbol: '30',
    theme: 'orange'
  }
]

function getBadgeState(data) {
  const date = today()
  const fastingStreak = consecutiveDays(data.fastingRecords, date, (item) => item.date)
  const waterStreak = consecutiveDays(
    data.waterRecords.filter((item) => totalWater([item]) > 0),
    date,
    (item) => item.date
  )
  const weightCount = data.weightRecords.length
  const totalCheckins = data.fastingRecords.length +
    data.waterRecords.filter((item) => totalWater([item]) > 0).length +
    data.dietRecords.length +
    data.exerciseRecords.length +
    weightCount

  return DEFINITIONS.map((item) => {
    let unlocked = false
    let progress = 0
    let progressText = ''

    if (item.id === 'fasting-3') {
      unlocked = fastingStreak >= 3
      progress = Math.min(fastingStreak / 3, 1)
      progressText = `${Math.min(fastingStreak, 3)}/3 天`
    }
    if (item.id === 'fasting-7') {
      unlocked = fastingStreak >= 7
      progress = Math.min(fastingStreak / 7, 1)
      progressText = `${Math.min(fastingStreak, 7)}/7 天`
    }
    if (item.id === 'fasting-21') {
      unlocked = fastingStreak >= 21
      progress = Math.min(fastingStreak / 21, 1)
      progressText = `${Math.min(fastingStreak, 21)}/21 天`
    }
    if (item.id === 'water-7') {
      unlocked = waterStreak >= 7
      progress = Math.min(waterStreak / 7, 1)
      progressText = `${Math.min(waterStreak, 7)}/7 天`
    }
    if (item.id === 'weight-4') {
      unlocked = weightCount >= 4
      progress = Math.min(weightCount / 4, 1)
      progressText = `${Math.min(weightCount, 4)}/4 次`
    }
    if (item.id === 'checkin-30') {
      unlocked = totalCheckins >= 30
      progress = Math.min(totalCheckins / 30, 1)
      progressText = `${Math.min(totalCheckins, 30)}/30 次`
    }

    return Object.assign({}, item, {
      unlocked,
      progress: Math.round(progress * 100),
      progressText
    })
  })
}

module.exports = {
  DEFINITIONS,
  getBadgeState
}
