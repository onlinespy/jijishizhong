const FASTING_TEMPLATES = [
  {
    id: '16-8',
    name: '16+8',
    fastingHours: 16,
    eatingHours: 8,
    mode: 'daily',
    description: '每日 8 小时进食窗口，其余时间按计划记录',
    defaultEatStart: '12:00',
    defaultEatEnd: '20:00'
  },
  {
    id: '14-10',
    name: '14+10',
    fastingHours: 14,
    eatingHours: 10,
    mode: 'daily',
    description: '每日 10 小时进食窗口，适合先建立规律记录',
    defaultEatStart: '09:00',
    defaultEatEnd: '19:00'
  },
  {
    id: '18-6',
    name: '18+6',
    fastingHours: 18,
    eatingHours: 6,
    mode: 'daily',
    description: '每日 6 小时进食窗口，请结合自身情况谨慎选择',
    defaultEatStart: '12:00',
    defaultEatEnd: '18:00'
  },
  {
    id: '5-2',
    name: '5+2',
    fastingHours: 0,
    eatingHours: 0,
    mode: 'weekly',
    description: '每周选择 2 天做计划内记录，其余 5 天保持日常饮食',
    defaultEatStart: '00:00',
    defaultEatEnd: '23:59'
  }
]

function getTemplate(id) {
  return FASTING_TEMPLATES.find((item) => item.id === id) || FASTING_TEMPLATES[0]
}

module.exports = {
  FASTING_TEMPLATES,
  getTemplate
}
