const assert = require('assert')
const date = require('../miniprogram/utils/date')
const calc = require('../miniprogram/utils/calc')
const { findFood } = require('../miniprogram/data/food-library')
const { getExercise } = require('../miniprogram/data/exercise-library')

assert.strictEqual(date.formatDate(date.toDate('2026-10-10')), '2026-10-10')
assert.strictEqual(date.addDays('2026-10-10', 5), '2026-10-15')
assert.strictEqual(date.diffDays('2026-10-01', '2026-10-10'), 9)

const grid = date.monthGrid('2026-10-01')
assert.strictEqual(grid.label, '2026年10月')
assert.strictEqual(grid.cells.filter((item) => item.date).length, 31)

assert.strictEqual(calc.calculateBMI(60, 170), 20.8)
assert.strictEqual(calc.calculateFoodCalories(findFood('rice'), 150, '克'), 174)
assert.strictEqual(calc.calculateFoodCalories(findFood('rice'), 1, '碗'), 174)
assert.strictEqual(calc.calculateExerciseCalories(getExercise('walk').met, 60, 30), 129)

const timeline = calc.getFastingTimeline({
  eatStart: '12:00',
  eatEnd: '20:00'
})
assert.strictEqual(timeline.eatingHours, 8)
assert.strictEqual(timeline.fastingHours, 16)
assert.strictEqual(calc.formatCountdown(3661), '01:01:01')

assert.strictEqual(calc.averageCycle([
  { start: '2026-08-01' },
  { start: '2026-08-29' },
  { start: '2026-09-26' }
]), 28)

assert.strictEqual(calc.consecutiveDays([
  { date: '2026-10-08' },
  { date: '2026-10-09' },
  { date: '2026-10-10' }
], '2026-10-10', (item) => item.date), 3)

console.log('核心计算测试通过')
