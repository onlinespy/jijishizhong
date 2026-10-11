const FOOD_GROUPS = [
  {
    id: 'staple',
    name: '主食',
    foods: [
      { id: 'rice', name: '米饭', kcalPer100g: 116, bowlGram: 150 },
      { id: 'congee', name: '白粥', kcalPer100g: 46, bowlGram: 250 },
      { id: 'steamed-bun', name: '馒头', kcalPer100g: 223 },
      { id: 'noodles', name: '煮面条', kcalPer100g: 110, bowlGram: 220 },
      { id: 'oat', name: '燕麦片', kcalPer100g: 377 },
      { id: 'sweet-potato', name: '蒸红薯', kcalPer100g: 86 },
      { id: 'corn', name: '煮玉米', kcalPer100g: 112 },
      { id: 'whole-wheat', name: '全麦面包', kcalPer100g: 246 }
    ]
  },
  {
    id: 'protein',
    name: '肉蛋奶',
    foods: [
      { id: 'egg', name: '鸡蛋', kcalPer100g: 144 },
      { id: 'chicken', name: '鸡胸肉', kcalPer100g: 133 },
      { id: 'beef', name: '瘦牛肉', kcalPer100g: 106 },
      { id: 'pork', name: '瘦猪肉', kcalPer100g: 143 },
      { id: 'salmon', name: '三文鱼', kcalPer100g: 139 },
      { id: 'tofu', name: '北豆腐', kcalPer100g: 116 },
      { id: 'milk', name: '纯牛奶', kcalPer100g: 54 },
      { id: 'yogurt', name: '原味酸奶', kcalPer100g: 72 }
    ]
  },
  {
    id: 'vegetable',
    name: '蔬果',
    foods: [
      { id: 'tomato', name: '番茄', kcalPer100g: 15 },
      { id: 'cucumber', name: '黄瓜', kcalPer100g: 16 },
      { id: 'broccoli', name: '西兰花', kcalPer100g: 36 },
      { id: 'spinach', name: '菠菜', kcalPer100g: 28 },
      { id: 'apple', name: '苹果', kcalPer100g: 53 },
      { id: 'banana', name: '香蕉', kcalPer100g: 93 },
      { id: 'orange', name: '橙子', kcalPer100g: 48 }
    ]
  },
  {
    id: 'home-cooking',
    name: '家常菜',
    foods: [
      { id: 'tomato-egg', name: '番茄炒蛋', kcalPer100g: 95 },
      { id: 'stir-fry-greens', name: '清炒时蔬', kcalPer100g: 72 },
      { id: 'braised-chicken', name: '红烧鸡块', kcalPer100g: 176 },
      { id: 'steamed-fish', name: '清蒸鱼', kcalPer100g: 105 },
      { id: 'mapo-tofu', name: '麻婆豆腐', kcalPer100g: 135 },
      { id: 'mixed-soup', name: '蔬菜汤', kcalPer100g: 26, bowlGram: 250 }
    ]
  }
]

function findFood(id) {
  for (let groupIndex = 0; groupIndex < FOOD_GROUPS.length; groupIndex += 1) {
    const group = FOOD_GROUPS[groupIndex]
    const food = group.foods.find((item) => item.id === id)
    if (food) {
      return Object.assign({ groupId: group.id, groupName: group.name }, food)
    }
  }
  return null
}

module.exports = {
  FOOD_GROUPS,
  findFood
}
