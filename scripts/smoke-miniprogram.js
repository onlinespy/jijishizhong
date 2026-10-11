const assert = require('assert')
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const storage = {}
const apps = []
const pages = []
const components = []

global.wx = {
  getStorageSync(key) {
    return storage[key]
  },
  setStorageSync(key, value) {
    storage[key] = value
  },
  cloud: null
}

global.App = (options) => apps.push(options)
global.Page = (options) => pages.push(options)
global.Component = (options) => components.push(options)
global.getApp = () => apps[0] || { globalData: {} }

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      return walk(target)
    }
    return [target]
  })
}

const jsFiles = walk(path.join(ROOT, 'miniprogram'))
  .filter((file) => file.endsWith('.js'))
  .sort()

jsFiles.forEach((file) => {
  require(file)
})

const appJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'miniprogram', 'app.json'), 'utf8'))
assert.strictEqual(apps.length, 1, 'App 注册数量不正确')
assert.strictEqual(pages.length, appJson.pages.length, 'Page 注册数量与 app.json 不一致')
assert.ok(pages.every((page) => typeof page === 'object'), '存在无效页面配置')
assert.strictEqual(components.length, 1, '自定义 TabBar 组件注册数量不正确')

const store = require('../miniprogram/utils/store')
const { generateDemoData } = require('../miniprogram/utils/demo-data')
const demo = generateDemoData()

assert.strictEqual(demo.fastingRecords.length, 14)
assert.strictEqual(demo.dietRecords.length, 70)
assert.strictEqual(demo.waterRecords.length, 56)
assert.ok(demo.exerciseRecords.length > 0)
assert.ok(demo.weightRecords.length > 0)
assert.ok(store.getData().periodRecords.length >= 2)

console.log('Mini program module smoke test passed')
