const store = require('./store')
const { createId } = require('./id')
const { addDays, today, formatTime } = require('./date')

const MEALS = [
  { mealType: '早餐', name: '燕麦牛奶', kcal: 310, amount: 1, unit: '份' },
  { mealType: '午餐', name: '米饭', kcal: 174, amount: 150, unit: '克' },
  { mealType: '午餐', name: '清蒸鱼', kcal: 158, amount: 150, unit: '克' },
  { mealType: '晚餐', name: '番茄炒蛋', kcal: 143, amount: 150, unit: '克' },
  { mealType: '加餐', name: '苹果', kcal: 96, amount: 180, unit: '克' }
]

const EXERCISES = [
  { name: '快走', duration: 35, kcal: 158 },
  { name: '瑜伽', duration: 30, kcal: 75 },
  { name: '健身操', duration: 25, kcal: 138 },
  { name: '骑行', duration: 40, kcal: 202 }
]

function generateDemoData() {
  const date = today()
  return store.update((data) => {
    data.profile = Object.assign({}, data.profile, {
      nickname: '演示用户',
      gender: '女',
      birthday: '1993-05-16',
      height: 165,
      weight: 57.8,
      hidePeriod: false
    })
    data.consents.fastingRisk = true
    data.fastingPlan = {
      enabled: true,
      templateId: '16-8',
      eatStart: '12:00',
      eatEnd: '20:00',
      updatedAt: new Date().toISOString()
    }
    data.settings.waterTarget = 2000
    data.fastingRecords = []
    data.dietRecords = []
    data.exerciseRecords = []
    data.weightRecords = []
    data.waterRecords = []
    data.periodRecords = []

    for (let offset = -13; offset <= 0; offset += 1) {
      const recordDate = addDays(date, offset)
      data.fastingRecords.push({
        id: createId('demo_fast'),
        date: recordDate,
        templateId: '16-8',
        eatStart: '12:00',
        eatEnd: '20:00',
        completedAt: `${recordDate}T20:30:00.000Z`
      })

      MEALS.forEach((meal, mealIndex) => {
        data.dietRecords.push(Object.assign({}, meal, {
          id: createId('demo_diet'),
          date: recordDate,
          source: 'manual',
          createdAt: `${recordDate}T${String(7 + mealIndex * 4).padStart(2, '0')}:00:00.000Z`
        }))
      })

      ;[200, 300, 500, 300].forEach((amount, waterIndex) => {
        data.waterRecords.push({
          id: createId('demo_water'),
          date: recordDate,
          amount,
          time: formatTime(new Date(`${recordDate}T${String(8 + waterIndex * 3).padStart(2, '0')}:00:00`))
        })
      })

      if (Math.abs(offset) % 2 === 0) {
        const exercise = EXERCISES[Math.abs(offset) % EXERCISES.length]
        data.exerciseRecords.push(Object.assign({}, exercise, {
          id: createId('demo_exercise'),
          date: recordDate,
          weight: 58,
          source: 'exercise-library',
          createdAt: `${recordDate}T18:00:00.000Z`
        }))
      }

      if (Math.abs(offset) % 3 === 0) {
        data.weightRecords.push({
          id: createId('demo_weight'),
          date: recordDate,
          weight: Math.round((58.4 - (14 + offset) * 0.05) * 10) / 10,
          createdAt: `${recordDate}T07:20:00.000Z`
        })
      }
    }

    data.periodRecords.push({
      id: createId('demo_period'),
      start: addDays(date, -17),
      end: addDays(date, -12),
      createdAt: new Date().toISOString()
    })
    data.periodRecords.push({
      id: createId('demo_period'),
      start: addDays(date, -46),
      end: addDays(date, -41),
      createdAt: new Date().toISOString()
    })
  })
}

module.exports = {
  generateDemoData
}
