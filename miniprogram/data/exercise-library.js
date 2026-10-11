const EXERCISE_LIBRARY = [
  { id: 'walk', name: '快走', met: 4.3, icon: '走' },
  { id: 'jog', name: '慢跑', met: 7.0, icon: '跑' },
  { id: 'rope', name: '跳绳', met: 10.0, icon: '跳' },
  { id: 'yoga', name: '瑜伽', met: 2.5, icon: '静' },
  { id: 'aerobics', name: '健身操', met: 6.0, icon: '操' },
  { id: 'cycling', name: '骑行', met: 5.5, icon: '骑' },
  { id: 'swim', name: '游泳', met: 6.0, icon: '泳' },
  { id: 'stairs', name: '爬楼梯', met: 5.0, icon: '阶' }
]

function getExercise(id) {
  return EXERCISE_LIBRARY.find((item) => item.id === id) || EXERCISE_LIBRARY[0]
}

module.exports = {
  EXERCISE_LIBRARY,
  getExercise
}
